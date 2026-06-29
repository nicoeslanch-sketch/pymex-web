const SERVICES = {
  'Planilla Excel Personalizada': {
    pipeline_id: 14023387,
    status_id: 108238127,
  },
  'Página Web': {
    pipeline_id: 14023535,
    status_id: 108239223,
  },
  'Optimización de Procesos': {
    pipeline_id: 14023539,
    status_id: 108239239,
  },
  'Plataforma de Análisis': {
    pipeline_id: 14023551,
    status_id: 108239307,
  },
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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
  const serviceType = clean(req.body?.serviceType)
  const service = SERVICES[serviceType]

  if (!name || !email || !phone || !serviceType) {
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

  const payload = [
    {
      name: `${serviceType} - ${name}`,
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
    const kommoBaseUrl = `https://${subdomain}.kommo.com`
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Account-ID': accountId,
    }

    const response = await fetch(`${kommoBaseUrl}/api/v4/leads/complex`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

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
      const noteText = [
        'Solicitud enviada desde pymex-web',
        `Servicio: ${serviceType}`,
        `Nombre: ${name}`,
        `Email: ${email}`,
        `Telefono: ${phone}`,
      ].join('\n')

      const noteResponse = await fetch(`${kommoBaseUrl}/api/v4/leads/${leadId}/notes`, {
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
        const noteError = await noteResponse.json().catch(() => ({}))
        console.warn('Kommo note warning:', leadId, noteResponse.status, noteError)
      }
    }

    console.info('Kommo lead created:', { leadId, contactId, serviceType })
    return res.status(200).json({ success: true, leadId, contactId, data })
  } catch (error) {
    console.error('Kommo submit error:', error)
    return res.status(500).json({
      success: false,
      error: 'No se pudo conectar con Kommo',
    })
  }
}
