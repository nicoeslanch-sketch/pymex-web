const SERVICES = {
  planilla: {
    label: 'Planilla Excel Personalizada',
    pipeline_id: 14023387,
    status_id: 108238131,
    tag_id: 22508,
    tag_name: 'Planillas',
  },
  web: {
    label: 'Pagina Web',
    pipeline_id: 14023535,
    status_id: 108239227,
    tag_id: 22510,
    tag_name: 'Paginas web',
  },
  procesos: {
    label: 'Optimizacion de Procesos',
    pipeline_id: 14023539,
    status_id: 108239243,
    tag_id: 22512,
    tag_name: 'Procesos',
  },
  plataforma: {
    label: 'Plataforma de Analisis',
    pipeline_id: 14023551,
    status_id: 108239311,
    tag_id: 22514,
    tag_name: 'Plataforma',
  },
}

const SERVICE_ALIASES = [
  ['planilla', 'planilla'],
  ['planillas', 'planilla'],
  ['excel', 'planilla'],
  ['pagina web', 'web'],
  ['pagina', 'web'],
  ['web', 'web'],
  ['optimizacion de procesos', 'procesos'],
  ['procesos', 'procesos'],
  ['proceso', 'procesos'],
  ['plataforma de analisis', 'plataforma'],
  ['plataforma', 'plataforma'],
  ['analisis', 'plataforma'],
]

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeText(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getService(value) {
  const normalized = normalizeText(value)
  const direct = Object.values(SERVICES).find(service => normalizeText(service.label) === normalized)
  if (direct) return direct

  const alias = SERVICE_ALIASES.find(([match]) => normalized.includes(match))
  return alias ? SERVICES[alias[1]] : null
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

function getKommoError(data, fallback) {
  return data?.detail || data?.title || fallback
}

function logKommoError(label, status, data) {
  console.error(label, status, JSON.stringify(data, null, 2))
}

async function createLead({ kommoBaseUrl, headers, service, name }) {
  const leadPayload = [
    {
      name: `${service.label} - ${name}`,
      pipeline_id: service.pipeline_id,
      price: 0,
      _embedded: {
        tags: [{ id: service.tag_id }],
      },
    },
  ]

  return requestJson(`${kommoBaseUrl}/api/v4/leads`, {
    method: 'POST',
    headers,
    body: JSON.stringify(leadPayload),
  })
}

async function moveLeadToServiceStatus({ kommoBaseUrl, headers, service, leadId }) {
  return requestJson(`${kommoBaseUrl}/api/v4/leads/${leadId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      pipeline_id: service.pipeline_id,
      status_id: service.status_id,
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const token = process.env.KOMMO_API_TOKEN
  const subdomain = process.env.KOMMO_SUBDOMAIN
  const accountId = process.env.KOMMO_ACCOUNT_ID

  if (!token || !subdomain || !accountId) {
    return res.status(500).json({
      success: false,
      error: 'Kommo environment variables are not configured',
    })
  }

  const name = clean(req.body?.name)
  const email = clean(req.body?.email).toLowerCase()
  const phone = clean(req.body?.phone)
  const rawServiceType = clean(req.body?.serviceType)
  const service = getService(rawServiceType)

  if (!name || !email || !phone || !rawServiceType) {
    return res.status(400).json({
      success: false,
      error: 'Nombre, email, telefono y servicio son obligatorios',
    })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Email invalido' })
  }

  if (!service) {
    return res.status(400).json({ success: false, error: 'Servicio invalido' })
  }

  const kommoBaseUrl = `https://${subdomain}.kommo.com`
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Account-ID': accountId,
  }

  const contactPayload = [
    {
      first_name: name,
      custom_fields_values: [
        {
          field_code: 'EMAIL',
          values: [{ value: email, enum_code: 'WORK' }],
        },
        {
          field_code: 'PHONE',
          values: [{ value: phone, enum_code: 'WORK' }],
        },
      ],
    },
  ]

  try {
    const { response: contactResponse, data: contactData } = await requestJson(`${kommoBaseUrl}/api/v4/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(contactPayload),
    })

    if (!contactResponse.ok) {
      logKommoError('Kommo contact error:', contactResponse.status, contactData)
      return res.status(contactResponse.status).json({
        success: false,
        error: getKommoError(contactData, 'Error creando contacto en Kommo'),
        details: contactData,
      })
    }

    const contact = Array.isArray(contactData)
      ? contactData[0]
      : contactData?._embedded?.contacts?.[0]
    const contactId = contact?.id

    const { response, data } = await createLead({
      kommoBaseUrl,
      headers,
      service,
      name,
    })

    if (!response.ok) {
      logKommoError('Kommo API error:', response.status, data)
      return res.status(response.status).json({
        success: false,
        error: getKommoError(data, 'Error creando lead en Kommo'),
        details: data,
      })
    }

    const lead = Array.isArray(data)
      ? data[0]
      : data?._embedded?.leads?.[0]
    const leadId = lead?.id

    if (leadId && contactId) {
      const { response: linkResponse, data: linkData } = await requestJson(`${kommoBaseUrl}/api/v4/leads/${leadId}/link`, {
        method: 'POST',
        headers,
        body: JSON.stringify([
          {
            to_entity_id: contactId,
            to_entity_type: 'contacts',
          },
        ]),
      })

      if (!linkResponse.ok) {
        console.warn('Kommo contact link warning:', leadId, contactId, linkResponse.status, JSON.stringify(linkData, null, 2))
      }
    }

    let movedToServiceStatus = false
    if (leadId) {
      const { response: moveResponse, data: moveData } = await moveLeadToServiceStatus({
        kommoBaseUrl,
        headers,
        service,
        leadId,
      })

      if (!moveResponse.ok) {
        logKommoError('Kommo lead status move error:', moveResponse.status, moveData)
        return res.status(moveResponse.status).json({
          success: false,
          leadId,
          contactId,
          error: getKommoError(moveData, 'Lead creado, pero no se pudo mover a Contactado'),
          details: moveData,
        })
      }

      movedToServiceStatus = true
    }

    if (leadId) {
      const noteText = [
        'Solicitud enviada desde pymex-web',
        `Servicio: ${service.label}`,
        `Pipeline asignado: ${service.pipeline_id}`,
        `Estado asignado: ${service.status_id}`,
        `Etiqueta asignada: ${service.tag_name} (${service.tag_id})`,
        `Movimiento a Contactado: ${movedToServiceStatus ? 'si' : 'no'}`,
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Telefono: ${phone}`,
      ].join('\n')

      const { response: noteResponse, data: noteError } = await requestJson(`${kommoBaseUrl}/api/v4/leads/${leadId}/notes`, {
        method: 'POST',
        headers,
        body: JSON.stringify([
          {
            note_type: 'common',
            params: { text: noteText },
          },
        ]),
      })

      if (!noteResponse.ok) {
        console.warn('Kommo note warning:', leadId, noteResponse.status, JSON.stringify(noteError, null, 2))
      }
    }

    let confirmedLead = null
    if (leadId) {
      const { response: confirmResponse, data: confirmData } = await requestJson(`${kommoBaseUrl}/api/v4/leads/${leadId}?with=tags`, {
        method: 'GET',
        headers,
      })

      if (!confirmResponse.ok) {
        console.warn('Kommo confirm warning:', leadId, confirmResponse.status, JSON.stringify(confirmData, null, 2))
      } else {
        confirmedLead = confirmData
      }
    }

    const confirmedPipelineId = confirmedLead?.pipeline_id
    const confirmedStatusId = confirmedLead?.status_id
    const confirmedTags = confirmedLead?._embedded?.tags || []
    const tagOk = !leadId || confirmedTags.some(tag => tag.id === service.tag_id)
    const pipelineOk = !leadId || confirmedPipelineId === service.pipeline_id
    const statusOk = !leadId || confirmedStatusId === service.status_id

    if (!pipelineOk || !statusOk) {
      console.error('Kommo routing mismatch:', {
        leadId,
        expectedPipelineId: service.pipeline_id,
        expectedStatusId: service.status_id,
        confirmedPipelineId,
        confirmedStatusId,
        confirmedTags,
      })
      return res.status(502).json({
        success: false,
        leadId,
        contactId,
        error: 'Lead creado, pero quedo en un embudo o estado distinto al esperado',
        expectedPipelineId: service.pipeline_id,
        expectedStatusId: service.status_id,
        confirmedPipelineId,
        confirmedStatusId,
      })
    }

    console.info('Kommo lead created:', {
      leadId,
      contactId,
      serviceType: service.label,
      pipelineId: service.pipeline_id,
      statusId: service.status_id,
      confirmedPipelineId,
      confirmedStatusId,
      tagId: service.tag_id,
      tagName: service.tag_name,
      confirmedTags,
      tagOk,
      statusOk,
      movedToServiceStatus,
    })

    return res.status(200).json({
      success: true,
      leadId,
      contactId,
      serviceType: service.label,
      pipelineId: service.pipeline_id,
      statusId: service.status_id,
      confirmedPipelineId,
      confirmedStatusId,
      tagId: service.tag_id,
      tagName: service.tag_name,
      confirmedTags,
      tagOk,
      statusOk,
      movedToServiceStatus,
      data,
    })
  } catch (error) {
    console.error('Kommo submit error:', error)
    return res.status(500).json({
      success: false,
      error: 'No se pudo conectar con Kommo',
    })
  }
}
