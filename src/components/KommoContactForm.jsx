import { useEffect, useMemo, useState } from 'react'

const SERVICES = [
  'Planilla Excel Personalizada',
  'Página Web',
  'Optimización de Procesos',
  'Plataforma de Análisis',
]

function createInitialForm(defaultService = SERVICES[0]) {
  return {
    name: '',
    email: '',
    phone: '',
    serviceType: SERVICES.includes(defaultService) ? defaultService : SERVICES[0],
  }
}

export default function KommoContactForm({ isOpen = true, onClose, defaultService = SERVICES[0] }) {
  const isCompact = useIsCompact()
  const [form, setForm] = useState(() => createInitialForm(defaultService))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const canClose = typeof onClose === 'function'
  const isSuccess = status.type === 'success'

  const title = useMemo(() => {
    if (isSuccess) return 'Solicitud recibida'
    return 'Conversemos sobre tu proyecto'
  }, [isSuccess])

  useEffect(() => {
    if (!isOpen || isSuccess) return
    setForm(prev => ({ ...prev, serviceType: createInitialForm(defaultService).serviceType }))
  }, [defaultService, isOpen, isSuccess])

  if (!isOpen) return null

  function handleChange(event) {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setStatus({ type: '', message: '' })
  }

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Ingresa tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Ingresa un email valido'
    if (!form.phone.trim()) nextErrors.phone = 'Ingresa tu telefono'
    if (!SERVICES.includes(form.serviceType)) nextErrors.serviceType = 'Selecciona un servicio'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/submit-kommo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          serviceType: form.serviceType,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No pudimos enviar tu solicitud')
      }

      setStatus({
        type: 'success',
        message: 'Gracias. Ya tenemos tus datos y te contactaremos pronto.',
      })
      setForm(createInitialForm(defaultService))
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Ocurrio un error. Intenta nuevamente.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ ...s.overlay, ...(isCompact ? s.overlayCompact : {}) }} role="presentation" onClick={canClose ? onClose : undefined}>
      <section
        style={{ ...s.modal, ...(isCompact ? s.modalCompact : {}) }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kommo-contact-title"
        onClick={event => event.stopPropagation()}
      >
        <div style={{ ...s.brandPanel, ...(isCompact ? s.brandPanelCompact : {}) }}>
          <div style={s.brandGlow} aria-hidden="true" />
          <div style={s.logoRow}>
            <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logo} />
            <strong style={s.brandName}>ADS <span style={s.goldText}>Veris</span></strong>
          </div>
          <img src="/images/oreja celu.png" alt="" style={{ ...s.agentImage, ...(isCompact ? s.agentImageCompact : {}) }} />
          <div style={s.colorRail} aria-hidden="true">
            <span style={{ ...s.railDot, background: '#0f766e' }} />
            <span style={{ ...s.railDot, background: '#c9a84c' }} />
            <span style={{ ...s.railDot, background: '#f06a5b' }} />
          </div>
        </div>

        <div style={{ ...s.content, ...(isCompact ? s.contentCompact : {}) }}>
          <div style={s.header}>
            <div>
              <p style={s.eyebrow}>ADS Veris</p>
              <h2 id="kommo-contact-title" style={s.title}>{title}</h2>
              <p style={s.subtitle}>Elige el servicio que necesitas y un asesor revisara tu caso.</p>
            </div>
            {canClose && (
              <button type="button" aria-label="Cerrar" style={s.closeButton} onClick={onClose}>
                x
              </button>
            )}
          </div>

          {status.message && (
            <div style={status.type === 'success' ? s.successBox : s.errorBox}>
              {status.message}
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} noValidate style={s.form}>
              <Field
                label="Nombre"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Tu nombre"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="tu@email.com"
              />
              <Field
                label="Telefono"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+56 9 1234 5678"
              />

              <div style={s.field}>
                <label htmlFor="serviceType" style={s.label}>Servicio</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  style={{ ...s.input, ...s.select, ...(errors.serviceType ? s.inputError : {}) }}
                >
                  {SERVICES.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                {errors.serviceType && <span style={s.errorText}>{errors.serviceType}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...s.submitButton, opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div style={s.field}>
      <label htmlFor={name} style={s.label}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
      />
      {error && <span style={s.errorText}>{error}</span>}
    </div>
  )
}

function useIsCompact(maxWidth = 720) {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  })

  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth <= maxWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidth])

  return isCompact
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'rgba(7, 18, 31, 0.72)',
    backdropFilter: 'blur(12px)',
    fontFamily: "'Poppins', 'Manrope', sans-serif",
  },
  overlayCompact: {
    alignItems: 'flex-start',
    padding: '12px',
    overflowY: 'auto',
  },
  modal: {
    width: 'min(94vw, 820px)',
    maxHeight: '92vh',
    overflow: 'auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 0.9fr) minmax(320px, 1.1fr)',
    background: '#f8fbfc',
    border: '1px solid rgba(201,168,76,0.34)',
    borderRadius: '8px',
    boxShadow: '0 26px 80px rgba(0,0,0,0.38)',
  },
  modalCompact: {
    width: 'min(100%, 430px)',
    maxHeight: 'none',
    gridTemplateColumns: '1fr',
  },
  brandPanel: {
    position: 'relative',
    minHeight: '520px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(150deg, #081525 0%, #0b2b3c 58%, #0f766e 100%)',
    overflow: 'hidden',
  },
  brandPanelCompact: {
    minHeight: '230px',
    padding: '20px',
  },
  brandGlow: {
    position: 'absolute',
    inset: 'auto -70px -80px -70px',
    height: '230px',
    background: 'radial-gradient(circle, rgba(201,168,76,0.34), rgba(15,118,110,0.2) 38%, transparent 70%)',
    pointerEvents: 'none',
  },
  agentImage: {
    position: 'absolute',
    left: '50%',
    bottom: '-22px',
    width: 'min(174%, 640px)',
    maxHeight: '112%',
    objectFit: 'contain',
    objectPosition: 'center bottom',
    transform: 'translateX(-50%)',
    filter: 'drop-shadow(0 24px 36px rgba(0,0,0,0.35))',
    pointerEvents: 'none',
  },
  agentImageCompact: {
    width: '390px',
    left: '50%',
    bottom: '-42px',
    maxHeight: '304px',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    zIndex: 2,
  },
  logo: {
    width: '132px',
    height: '132px',
    objectFit: 'contain',
    flex: '0 0 auto',
  },
  brandName: {
    color: '#f8fbfc',
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: 0,
  },
  goldText: {
    color: '#c9a84c',
  },
  colorRail: {
    display: 'flex',
    gap: '10px',
    position: 'relative',
    zIndex: 2,
  },
  railDot: {
    width: '42px',
    height: '6px',
    borderRadius: '999px',
    display: 'block',
  },
  content: {
    padding: '34px',
    color: '#081525',
  },
  contentCompact: {
    padding: '24px 20px',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '18px',
    marginBottom: '22px',
  },
  eyebrow: {
    margin: '0 0 6px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0f766e',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(24px, 3vw, 34px)',
    lineHeight: 1.12,
    fontWeight: 800,
    letterSpacing: 0,
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#526173',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  closeButton: {
    width: '36px',
    height: '36px',
    border: '1px solid rgba(8,21,37,0.12)',
    borderRadius: '999px',
    background: '#ffffff',
    color: '#081525',
    fontSize: '18px',
    lineHeight: 1,
    cursor: 'pointer',
  },
  form: {
    display: 'grid',
    gap: '14px',
  },
  field: {
    display: 'grid',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#243447',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    minHeight: '46px',
    padding: '12px 14px',
    border: '1px solid rgba(8,21,37,0.16)',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#081525',
    fontSize: '15px',
    outline: 'none',
  },
  select: {
    appearance: 'auto',
  },
  inputError: {
    borderColor: '#f06a5b',
    boxShadow: '0 0 0 3px rgba(240,106,91,0.12)',
  },
  errorText: {
    color: '#c24135',
    fontSize: '12px',
    fontWeight: 600,
  },
  submitButton: {
    minHeight: '48px',
    marginTop: '6px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #c9a84c 0%, #f0d58b 100%)',
    color: '#081525',
    fontWeight: 800,
    fontSize: '15px',
  },
  successBox: {
    padding: '13px 14px',
    marginBottom: '16px',
    borderRadius: '8px',
    background: 'rgba(15,118,110,0.1)',
    border: '1px solid rgba(15,118,110,0.25)',
    color: '#0f766e',
    fontSize: '14px',
    fontWeight: 700,
  },
  errorBox: {
    padding: '13px 14px',
    marginBottom: '16px',
    borderRadius: '8px',
    background: 'rgba(240,106,91,0.1)',
    border: '1px solid rgba(240,106,91,0.28)',
    color: '#b13d31',
    fontSize: '14px',
    fontWeight: 700,
  },
}
