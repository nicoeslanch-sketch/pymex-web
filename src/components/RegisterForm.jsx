import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import dibujoTabletImg from '../../assets/images/dibujo con tablet.png'
import senalandoImg from '../../assets/images/señalando.png'

function validarRut(rut) {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0, multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const expected = 11 - (sum % 11)
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === dvExpected
}

function formatearRut(value) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return ''
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  return body.length > 0 ? `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}` : dv
}

export default function RegisterForm() {
  const isMobile = useIsMobile()
  const [form, setForm] = useState({ email: '', password: '', confirm: '', nombre: '', apellido: '', rut: '', telefono: '' })
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  const passwordsOk = form.password.length >= 8 && form.confirm.length > 0 && form.password === form.confirm

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'rut' ? formatearRut(value) : value }))
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Obligatorio'
    if (!form.apellido.trim()) e.apellido = 'Obligatorio'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.password || form.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (!form.confirm) e.confirm = 'Repite la contraseña'
    else if (form.confirm !== form.password) e.confirm = 'No coinciden'
    if (!form.rut.trim() || !validarRut(form.rut)) e.rut = 'RUT inválido'
    if (!form.telefono.trim()) e.telefono = 'Obligatorio'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    const ev = validar()
    if (Object.keys(ev).length > 0) { setErrores(ev); return }

    setLoading(true)
    try {
      const userMetadata = {
        full_name: `${form.nombre.trim()} ${form.apellido.trim()}`,
        rut: form.rut,
        phone: form.telefono,
        plan_id: 'free',
      }
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: userMetadata },
      })
      if (signUpError) throw signUpError
      saveLocalProfile(form.email, userMetadata)
      const userId = data.user?.id
      if (userId) {
        const { error: metaError } = await supabase.from('users_metadata').insert({
          user_id: userId,
          ...userMetadata,
        })
        if (metaError) console.warn('No se pudo guardar users_metadata:', metaError.message)
      }
      setSuccess(true)
    } catch (err) {
      const msg = err?.message && err.message.trim() !== '{}' && err.message.trim() !== ''
        ? err.message
        : 'Error al registrarse. Intenta de nuevo.'
      setErrorGeneral(msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={sx(s.page, isMobile && s.pageMobile)}>
        <div style={s.grid} aria-hidden="true" />
        <header style={sx(s.header, isMobile && s.headerMobile)}>
          <a href="/" style={s.logoWrap}>
            <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logoImg} />
            <span style={s.logoText}>ADS <span style={s.logoGold}>Veris</span></span>
          </a>
        </header>
        <div style={sx(s.successWrap, isMobile && s.successWrapMobile)}>
          <div style={sx(s.successCard, isMobile && s.successCardMobile)}>
            <span style={s.successIcon}>✅</span>
            <h2 style={s.successTitle}>¡Registro exitoso!</h2>
            <p style={s.successMsg}>Enviamos un correo de confirmación a <strong style={{ color: '#c9a84c' }}>{form.email}</strong>. Revisa tu bandeja y confirma tu cuenta para ingresar.</p>
            <a href="/login" style={s.successBtn}>Ir a iniciar sesión →</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={sx(s.page, isMobile && s.pageMobile)}>
      <div style={s.grid} aria-hidden="true" />

      {/* Header */}
      <header style={sx(s.header, isMobile && s.headerMobile)}>
        <a href="/" style={s.logoWrap}>
          <img src="/images/logo-ads-veris.png" alt="ADS Veris" style={s.logoImg} />
          <span style={s.logoText}>ADS <span style={s.logoGold}>Veris</span></span>
        </a>
        <a href="/login" style={sx(s.headerLink, isMobile && s.headerLinkMobile)}>¿Ya tienes cuenta? <span style={s.headerLinkGold}>Inicia sesión</span></a>
      </header>

      {/* Main split */}
      <main style={sx(s.main, isMobile && s.mainMobile)}>

        {/* Imagen izquierda */}
        <div style={sx(s.sideCol, isMobile && s.sideColMobile, isMobile && s.leftVisualMobile)}>
          <img
            src={senalandoImg}
            alt="Señalando el formulario de registro"
            style={sx(s.imgSenalando, isMobile && s.imgSenalandoMobile)}
          />
        </div>
        {/* Formulario derecho */}
        <div style={sx(s.formCol, isMobile && s.formColMobile)}>
          <div style={sx(s.card, isMobile && s.cardMobile)}>
            <div style={s.cardHeader}>
              <span style={s.eyebrow}>Empieza gratis</span>
              <h1 style={s.titulo}>Crear cuenta</h1>
              <p style={s.subtitulo}>Accede a planillas, análisis y más herramientas para tu PyME.</p>
            </div>

            {errorGeneral && <div style={s.alertError}>{errorGeneral}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={sx(s.fila, isMobile && s.filaMobile)}>
                <Campo label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} placeholder="Juan" />
                <Campo label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} error={errores.apellido} placeholder="Pérez" />
              </div>

              <Campo label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errores.email} placeholder="tu@email.com" />

              <CampoPassword label="Contraseña" name="password" value={form.password} onChange={handleChange} error={errores.password} placeholder="Mínimo 8 caracteres" ok={passwordsOk} />
              <CampoPassword label="Repetir contraseña" name="confirm" value={form.confirm} onChange={handleChange} error={errores.confirm} placeholder="Repite tu contraseña" ok={passwordsOk} />

              <div style={sx(s.fila, isMobile && s.filaMobile)}>
                <Campo label="RUT" name="rut" value={form.rut} onChange={handleChange} error={errores.rut} placeholder="12.345.678-K" />
                <Campo label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} error={errores.telefono} placeholder="+56912345678" />
              </div>

              <button
                type="submit"
                disabled={loading || !passwordsOk}
                style={{ ...s.btn, opacity: (loading || !passwordsOk) ? 0.5 : 1, cursor: (loading || !passwordsOk) ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            <div style={sx(s.cardFooter, isMobile && s.cardFooterMobile)}>
              <span style={s.footerMuted}>¿Ya tienes cuenta?</span>
              <a href="/login" style={s.linkGold}>Iniciar sesión →</a>
            </div>
          </div>
        </div>

        <div style={sx(s.sideCol, isMobile && s.sideColMobile, isMobile && s.rightVisualMobile)}>
          <img
            src={dibujoTabletImg}
            alt="Ilustración tablet"
            style={sx(s.imgTablet, isMobile && s.imgTabletMobile)}
          />
        </div>

      </main>
    </div>
  )
}

function Campo({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
      />
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  )
}

function CampoPassword({ label, name, value, onChange, error, placeholder, ok }) {
  const borderColor = ok ? '#43c59e' : error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="password"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ ...s.input, borderColor, paddingRight: ok ? '40px' : '14px', width: '100%' }}
        />
        {ok && (
          <span style={s.tick}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="9" fill="#43c59e" />
              <polyline points="5,9.5 7.5,12 13,6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  )
}

function useIsMobile(maxWidth = 780) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= maxWidth
  })

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= maxWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [maxWidth])

  return isMobile
}

function sx(...styles) {
  return Object.assign({}, ...styles.filter(Boolean))
}

function saveLocalProfile(email, metadata) {
  try {
    localStorage.setItem(`adsveris_profile:${email.trim().toLowerCase()}`, JSON.stringify(metadata))
  } catch {
    // El registro no debe fallar si el navegador bloquea localStorage.
  }
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0d2235 0%, #1a3a52 55%, #0f2a3f 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  pageMobile: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  grid: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    background: `
      linear-gradient(rgba(108,141,168,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(108,141,168,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    zIndex: 0,
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 40px',
    borderBottom: '1px solid rgba(247,199,95,0.1)',
    backdropFilter: 'blur(8px)',
  },
  headerMobile: {
    padding: '16px 18px',
    gap: '16px',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoImg: { height: '34px', width: 'auto' },
  logoText: { fontSize: '17px', fontWeight: '700', color: '#f5f9fe', fontFamily: "'Sora', sans-serif" },
  logoGold: { color: '#c9a84c' },
  headerLink: { fontSize: '14px', color: '#ccd8ea' },
  headerLinkMobile: { fontSize: '13px', lineHeight: '1.3', textAlign: 'right' },
  headerLinkGold: { color: '#c9a84c', fontWeight: '600' },

  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(420px, 460px) minmax(220px, 1fr)',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    padding: '32px 40px 48px',
    gap: '28px',
    maxWidth: '1380px',
    margin: '0 auto',
    width: '100%',
  },
  mainMobile: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: '24px 16px 36px',
    gap: '18px',
    maxWidth: '520px',
    overflow: 'visible',
  },

  sideCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minWidth: 0,
    minHeight: '660px',
  },
  sideColMobile: {
    minHeight: 'auto',
    width: '100%',
  },
  leftVisualMobile: { order: 2 },
  rightVisualMobile: { order: 3 },
  imgSenalando: {
    width: 'clamp(380px, 38vw, 640px)',
    maxWidth: '145%',
    height: 'auto',
    objectFit: 'contain',
    position: 'relative',
    zIndex: 2,
    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
    transform: 'scaleX(-1)',
  },
  imgSenalandoMobile: {
    width: 'min(76vw, 280px)',
    maxWidth: '100%',
  },
  imgTablet: {
    position: 'relative',
    zIndex: 3,
    width: 'clamp(250px, 26vw, 400px)',
    maxWidth: '110%',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
    filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.28))',
  },
  imgTabletMobile: {
    width: 'min(72vw, 260px)',
    maxWidth: '100%',
  },

  formCol: { width: '460px', flexShrink: 0 },
  formColMobile: {
    order: 1,
    width: '100%',
    flexShrink: 1,
  },
  card: {
    background: 'rgba(9,28,45,0.85)',
    border: '1px solid rgba(199,168,106,0.18)',
    borderRadius: '16px',
    padding: '36px 36px 32px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  cardMobile: {
    width: '100%',
    padding: '30px 22px',
    borderRadius: '14px',
  },
  cardHeader: { marginBottom: '24px' },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#c9a84c',
    display: 'block',
    marginBottom: '8px',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f5f9fe',
    marginBottom: '6px',
    fontFamily: "'Sora', sans-serif",
  },
  subtitulo: { fontSize: '13px', color: '#8ba3bc', lineHeight: '1.5' },

  alertError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#fca5a5',
  },

  fila: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  filaMobile: { gridTemplateColumns: '1fr', gap: '0px' },
  campo: { display: 'flex', flexDirection: 'column', marginBottom: '14px' },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ccd8ea',
    marginBottom: '6px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  input: {
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#f5f9fe',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s',
  },
  inputError: { borderColor: 'rgba(239,68,68,0.6)' },
  errorMsg: { color: '#fca5a5', fontSize: '11px', marginTop: '4px' },

  tick: {
    position: 'absolute',
    right: '11px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },

  btn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '8px',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '18px',
    borderTop: '1px solid rgba(199,168,106,0.12)',
  },
  cardFooterMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
  },
  footerMuted: { fontSize: '13px', color: '#8ba3bc' },
  linkGold: { fontSize: '13px', color: '#c9a84c', fontWeight: '600' },

  // Success screen
  successWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    zIndex: 1,
  },
  successWrapMobile: { padding: '24px 16px' },
  successCard: {
    background: 'rgba(9,28,45,0.85)',
    border: '1px solid rgba(199,168,106,0.18)',
    borderRadius: '16px',
    padding: '52px 44px',
    maxWidth: '440px',
    textAlign: 'center',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  successCardMobile: {
    width: '100%',
    padding: '38px 24px',
  },
  successIcon: { fontSize: '44px', display: 'block', marginBottom: '16px' },
  successTitle: { fontSize: '22px', fontWeight: '800', color: '#f5f9fe', marginBottom: '12px', fontFamily: "'Sora', sans-serif" },
  successMsg: { fontSize: '14px', color: '#8ba3bc', lineHeight: '1.7', marginBottom: '28px' },
  successBtn: {
    display: 'inline-block',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
  },
}
