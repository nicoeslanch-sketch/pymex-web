import sgMail from '@sendgrid/mail'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTACTADOS = {
  14023387: {
    service: 'Planilla Excel personalizada',
    statusId: 108238131,
    marker: 'ADSVERIS_CONTACTADOS_EMAIL_PLANILLAS_V1',
    subject: 'Tu Sistema de Medicion a Medida',
    pdfFile: 'ADS_Veris_Planillas_Excel.pdf',
    paragraphs: [
      'Gracias por interesarte en nuestra Plantilla Personalizada.',
      'Cansado de hojas de Excel desorganizadas? Nosotros disenamos la tuya desde cero.',
      'En una reunion de 1 hora definimos que KPIs realmente importan en tu negocio, como automatizar los calculos y que reportes necesitas para tomar decisiones.',
      'El resultado: una plantilla unica, hecha para ti, con formulas automaticas, dashboards visuales y 30 dias de soporte.',
      'Disponibilidad: lunes a viernes 10:00-18:00 CLT.',
    ],
    closing: 'Agendamos?',
  },
  14023535: {
    service: 'Paginas web para pymes',
    statusId: 108239227,
    marker: 'ADSVERIS_CONTACTADOS_EMAIL_WEB_V1',
    subject: 'Tu Pagina Web Profesional desde $39.990',
    pdfFile: 'ADS_Veris_Paginas_Web.pdf',
    paragraphs: [
      'Recibimos tu interes en una pagina web.',
      'Sin complicaciones. Sin sorpresas. Sin esperas.',
      'Nuestras paginas web para PyMEs incluyen diseno responsive, formularios de contacto integrados, SEO basico, dominio + hosting 1 ano incluidos y chat con WhatsApp integrado.',
      'Desde: $39.990, antes $55.000. Entrega estimada: 7 a 10 dias.',
    ],
    closing: 'Hablamos de tu proyecto?',
  },
  14023539: {
    service: 'Optimizacion de procesos',
    statusId: 108239243,
    marker: 'ADSVERIS_CONTACTADOS_EMAIL_PROCESOS_V1',
    subject: 'Tus Procesos, Optimizados',
    pdfFile: 'ADS_Veris_Procesos.pdf',
    paragraphs: [
      'Los procesos ineficientes cuestan dinero.',
      'Analizamos tus flujos actuales y te entregamos diagnostico de cuellos de botella, diagrama de procesos mejorado, plan de accion paso a paso y seguimiento por 60 dias.',
      'El tiempo invertido de tu lado suele ser 2 a 3 horas. El retorno: procesos mas rapidos, menos errores y mas claridad operativa.',
      'Duracion estimada: 2 a 4 semanas de implementacion. Inversion unica, sin suscripcion.',
    ],
    closing: 'Conversamos?',
  },
  14023551: {
    service: 'Plataforma de analisis',
    statusId: 108239311,
    marker: 'ADSVERIS_CONTACTADOS_EMAIL_PLATAFORMA_V1',
    subject: 'Tu Analista de Datos Inteligente',
    pdfFile: 'ADS_Veris_Plataforma_Analisis.pdf',
    paragraphs: [
      'Contratar un analista de datos cuesta caro. Nosotros tenemos una alternativa mas simple para empezar.',
      'Nuestra plataforma te permite subir tu Excel, limpiar datos, ver dashboards con KPIs reales, conversar con IA sobre tus numeros y recibir recomendaciones accionables.',
      'Ejemplo: Producto X no vende, considera sacarlo de circulacion. Ejemplo: exceso de efectivo detectado, reinvierte en una linea con mejor retorno.',
      'Puedes probar la plataforma desde https://pymex-web.vercel.app.',
    ],
    closing: 'Preguntas? Responde este correo y te ayudamos.',
  },
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseWebhookBody(body) {
  if (!body) return []
  if (typeof body === 'string') return parseWebhookParams(new URLSearchParams(body))
  if (body instanceof URLSearchParams) return parseWebhookParams(body)
  if (typeof body === 'object') {
    const fromNested = collectLeadCandidates(body)
    if (fromNested.length) return fromNested
    return parseWebhookParams(new URLSearchParams(body))
  }
  return []
}

function parseWebhookParams(params) {
  const grouped = {}

  for (const [key, value] of params.entries()) {
    const match = key.match(/^leads\[([^\]]+)\]\[(\d+)\]\[([^\]]+)\]$/)
    if (!match) continue
    const [, event, index, field] = match
    grouped[index] = grouped[index] || {}
    grouped[index].event = event
    grouped[index][field] = value
  }

  return Object.values(grouped).map(toCandidate).filter(Boolean)
}

function collectLeadCandidates(value, candidates = []) {
  if (Array.isArray(value)) {
    value.forEach(item => collectLeadCandidates(item, candidates))
    return candidates
  }

  if (!value || typeof value !== 'object') return candidates

  const candidate = toCandidate(value)
  if (candidate) candidates.push(candidate)

  Object.values(value).forEach(item => collectLeadCandidates(item, candidates))
  return candidates
}

function toCandidate(value) {
  const leadId = Number(value.id || value.lead_id || value.entity_id)
  const pipelineId = Number(value.pipeline_id)
  const statusId = Number(value.status_id)

  if (!leadId || !pipelineId || !statusId) return null
  return { leadId, pipelineId, statusId, event: value.event || value.action || value.type || null }
}

async function kommoJson(path, options = {}) {
  const token = process.env.KOMMO_API_TOKEN
  const subdomain = process.env.KOMMO_SUBDOMAIN
  const accountId = process.env.KOMMO_ACCOUNT_ID

  if (!token || !subdomain || !accountId) {
    throw new Error('Kommo environment variables are not configured')
  }

  const response = await fetch(`https://${subdomain}.kommo.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Account-ID': accountId,
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(`Kommo API error ${response.status}: ${JSON.stringify(data)}`)
  }

  return data
}

function getContactEmail(contact) {
  const fields = contact?.custom_fields_values || []
  const emailField = fields.find(field => field.field_code === 'EMAIL' || field.code === 'EMAIL')
  return clean(emailField?.values?.[0]?.value).toLowerCase()
}

async function getLeadContext(leadId) {
  const lead = await kommoJson(`/api/v4/leads/${leadId}?with=contacts,tags`)
  const contactId = lead?._embedded?.contacts?.[0]?.id
  const contact = contactId ? await kommoJson(`/api/v4/contacts/${contactId}`) : null

  return {
    lead,
    contact,
    email: getContactEmail(contact),
    name: clean(contact?.name || lead?.name || 'Hola'),
  }
}

async function hasSentEmail(leadId, marker) {
  const notes = await kommoJson(`/api/v4/leads/${leadId}/notes?limit=100`)
  const list = notes?._embedded?.notes || []
  return list.some(note => {
    const text = note?.params?.text || ''
    return text.includes(marker)
  })
}

async function addLeadNote(leadId, text) {
  return kommoJson(`/api/v4/leads/${leadId}/notes`, {
    method: 'POST',
    body: JSON.stringify([
      {
        note_type: 'common',
        params: { text },
      },
    ]),
  })
}

function emailHtml({ template, name }) {
  const paragraphs = template.paragraphs
    .map(paragraph => `<p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">${paragraph}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${template.subject}</title></head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#09111f 0%,#164e63 100%);padding:34px 40px;text-align:center;">
            <p style="margin:0;font-size:26px;font-weight:800;color:#f5f9fe;">ADS <span style="color:#c9a84c;">Veris</span></p>
            <p style="margin:8px 0 0 0;font-size:12px;color:rgba(255,255,255,0.58);text-transform:uppercase;letter-spacing:0.1em;">${template.service}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:42px 40px;">
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:#0f766e;text-transform:uppercase;letter-spacing:0.1em;">Solicitud recibida</p>
            <h1 style="margin:0 0 20px 0;font-size:23px;font-weight:800;color:#09111f;">Hola ${name}, ya estamos revisando tu solicitud</h1>
            ${paragraphs}
            <p style="margin:0 0 26px 0;font-size:15px;color:#374151;line-height:1.7;">${template.closing}</p>
            <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.7;">Adjuntamos informacion del servicio. Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles que consideres importantes.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#09111f;">ADS <span style="color:#c9a84c;">Veris</span></p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">servicios@adsveris.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function emailText({ template, name }) {
  return [
    `Hola ${name}, ya estamos revisando tu solicitud.`,
    '',
    ...template.paragraphs.flatMap(paragraph => [paragraph, '']),
    template.closing,
    '',
    'Adjuntamos informacion del servicio. Si quieres adelantarnos mas contexto, responde este correo con archivos, referencias o detalles importantes.',
    '',
    'ADS Veris',
    'servicios@adsveris.com',
  ].join('\n')
}

function getPdfAttachment(template) {
  if (!template.pdfFile) return { attachments: [], missingPdf: null }

  const filePath = join(process.cwd(), 'pdfs', template.pdfFile)
  if (!existsSync(filePath)) {
    return { attachments: [], missingPdf: template.pdfFile }
  }

  return {
    attachments: [
      {
        content: readFileSync(filePath).toString('base64'),
        filename: template.pdfFile,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
    missingPdf: null,
  }
}

async function sendContactadosEmail({ leadId, template, email, name }) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY
  if (!sendgridApiKey) throw new Error('SENDGRID_API_KEY not configured')

  const { attachments, missingPdf } = getPdfAttachment(template)

  sgMail.setApiKey(sendgridApiKey)
  await sgMail.send({
    to: email,
    from: { email: process.env.CONTACTADOS_EMAIL_FROM || 'noreply@adsveris.com', name: 'ADS Veris' },
    replyTo: process.env.CONTACTADOS_EMAIL_REPLY_TO || 'servicios@adsveris.com',
    subject: template.subject,
    text: emailText({ template, name }),
    html: emailHtml({ template, name }),
    attachments,
  })

  await addLeadNote(
    leadId,
    [
      template.marker,
      `Correo automatico Contactados enviado a ${email}`,
      `Asunto: ${template.subject}`,
      attachments.length ? `PDF adjunto: ${template.pdfFile}` : `PDF pendiente/no encontrado: ${missingPdf || 'sin PDF configurado'}`,
    ].join('\n')
  )
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ success: true, webhook: 'kommo-contactados' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const expectedSecret = process.env.KOMMO_WEBHOOK_SECRET
  if (expectedSecret && req.query?.secret !== expectedSecret) {
    return res.status(401).json({ success: false, error: 'Unauthorized webhook' })
  }

  const candidates = parseWebhookBody(req.body)
  const targets = candidates.filter(candidate => {
    const template = CONTACTADOS[candidate.pipelineId]
    return template && candidate.statusId === template.statusId
  })

  const results = []

  for (const target of targets) {
    const template = CONTACTADOS[target.pipelineId]
    try {
      const alreadySent = await hasSentEmail(target.leadId, template.marker)
      if (alreadySent) {
        results.push({ leadId: target.leadId, pipelineId: target.pipelineId, skipped: true, reason: 'already_sent' })
        continue
      }

      const context = await getLeadContext(target.leadId)
      if (!context.email) {
        results.push({ leadId: target.leadId, pipelineId: target.pipelineId, skipped: true, reason: 'missing_email' })
        continue
      }

      await sendContactadosEmail({
        leadId: target.leadId,
        template,
        email: context.email,
        name: context.name,
      })

      results.push({ leadId: target.leadId, pipelineId: target.pipelineId, email: context.email, sent: true })
    } catch (error) {
      console.error('Kommo contactados webhook error:', target, error)
      try {
        const template = CONTACTADOS[target.pipelineId]
        if (template) {
          const failureMarker = `${template.marker}_FAILED`
          const failureAlreadyNoted = await hasSentEmail(target.leadId, failureMarker)
          if (!failureAlreadyNoted) {
            await addLeadNote(
              target.leadId,
              [
                failureMarker,
                'No se pudo enviar el correo automatico Contactado.',
                `Error: ${error.message}`,
                '',
                'Plantilla manual sugerida:',
                `Asunto: ${template.subject}`,
                '',
                emailText({ template, name: 'cliente' }),
                '',
                `PDF sugerido: ${template.pdfFile || 'sin PDF configurado'}`,
              ].join('\n')
            )
          }
        }
      } catch (noteError) {
        console.error('Kommo contactados failure note error:', target, noteError)
      }
      results.push({ leadId: target.leadId, pipelineId: target.pipelineId, error: error.message })
    }
  }

  return res.status(200).json({
    success: true,
    received: candidates.length,
    matched: targets.length,
    results,
  })
}
