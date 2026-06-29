const SERVICES = {
  planilla: {
    label: 'Planilla Excel Personalizada',
    pipeline_id: 14023387,
    status_id: 108238127,
  },
  web: {
    label: 'Página Web',
    pipeline_id: 14023535,
    status_id: 108239223,
  },
  procesos: {
    label: 'Optimización de Procesos',
    pipeline_id: 14023539,
    status_id: 108239239,
  },
  plataforma: {
    label: 'Plataforma de Análisis',
    pipeline_id: 14023551,
    status_id: 108239307,
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

  const payload = [
    {
      name: `${service.label} - ${name}`,
      pipeline_id: service.pipeline_id,
      status_id: service.status_id,
      price: 0,
      _embedded: {
        contacts: [
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
        ],
      },
    },
  ]

  try {
    const { response, data } = await requestJson(`${kommoBaseUrl}/api/v4/leads/complex`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Kommo API error:', response.status, data)
      return res.status(response.status).json({
        success: false,
        error: data?.detail || data?.title || 'Error creando lead en Kommo',
      })
    }

    const lead = Array.isArray(data) ? data[0] : null
    const leadId = lead?.id
    const contactId = lead?.contact_id

    if (leadId) {
      const updatePayload = [
        {
          id: leadId,
          pipeline_id: service.pipeline_id,
          status_id: service.status_id,
        },
      ]

      const { response: updateResponse, data: updateData } = await requestJson(`${kommoBaseUrl}/api/v4/leads`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updatePayload),
      })

      if (!updateResponse.ok) {
        console.error('Kommo pipeline update error:', leadId, updateResponse.status, updateData)
        return res.status(502).json({
          success: false,
          leadId,
          contactId,
          error: 'Lead creado, pero Kommo no permitio moverlo al embudo correcto',
        })
      }

      const noteText = [
        'Solicitud enviada desde pymex-web',
        `Servicio: ${service.label}`,
        `Pipeline asignado: ${service.pipeline_id}`,
        `Estado asignado: ${service.status_id}`,
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
        console.warn('Kommo note warning:', leadId, noteResponse.status, noteError)
      }
    }

    let confirmedLead = null
    if (leadId) {
      const { response: confirmResponse, data: confirmData } = await requestJson(`${kommoBaseUrl}/api/v4/leads/${leadId}`, {
        method: 'GET',
        headers,
      })

      if (!confirmResponse.ok) {
        console.warn('Kommo confirm warning:', leadId, confirmResponse.status, confirmData)
      } else {
        confirmedLead = confirmData
      }
    }

    const confirmedPipelineId = confirmedLead?.pipeline_id
    const confirmedStatusId = confirmedLead?.status_id
    const pipelineOk = !leadId || (
      confirmedPipelineId === service.pipeline_id &&
      confirmedStatusId === service.status_id
    )

    if (!pipelineOk) {
      console.error('Kommo pipeline mismatch:', {
        leadId,
        expectedPipelineId: service.pipeline_id,
        expectedStatusId: service.status_id,
        confirmedPipelineId,
        confirmedStatusId,
      })
      return res.status(502).json({
        success: false,
        leadId,
        contactId,
        error: 'Lead creado, pero quedo en un embudo distinto al esperado',
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
