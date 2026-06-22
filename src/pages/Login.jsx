import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import logoImg from '../../assets/images/logo-ads-veris.png'
import saludandoImg from '../../assets/images/saludando.png'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [loading, setLoading] = useState(false)
  const intentos = useRef(0)
  const ventanaInicio = useRef(Date.now())

  function validar() {
    const e = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Ingresa un email válido'
    if (!password) e.password = 'La contraseña es obligatoria'
    return e
  }

  function verificarRateLimit() {
    const ahora = Date.now()
    if (ahora - ventanaInicio.current > RATE_LIMIT_WINDOW_MS) {
      intentos.current = 0
      ventanaInicio.current = ahora
    }
    if (intentos.current >= RATE_LIMIT_MAX) {
      const min = Math.ceil((RATE_LIMIT_WINDOW_MS - (ahora - ventanaInicio.current)) / 60000)
      return `Demasiados intentos. Intenta en ${min} minuto${min !== 1 ? 's' : ''}.`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    const ev = validar()
    if (Object.keys(ev).length > 0) { setErrores(ev); return }
    const rl = verificarRateLimit()
    if (rl) { setErrorGeneral(rl); return }

    setLoading(true)
    intentos.current += 1
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const inicial = (data.user.email || '?')[0].toUpperCase()
      localStorage.setItem('adsveris_user', JSON.stringify({
        name: data.user.email,
        email: data.user.email,
        initial: inicial,
      }))
      window.location.href = '/'
    } catch (err) {
      setErrorGeneral(err.message || 'Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Grid overlay */}
      <div style={s.grid} aria-hidden="true" />

      {/* Header */}
      <header style={s.header}>
        <a href="/" style={s.logoWrap}>
          <img src={logoImg} alt="ADS Veris" style={s.logoImg} />
          <span style={s.logoText}>ADS <span style={s.logoGold}>Veris</span></span>
        </a>
        <a href="/register" style={s.headerLink}>¿No tienes cuenta? <span style={s.headerLinkGold}>Regístrate</span></a>
      </header>

      {/* Main split */}
      <main style={s.main}>

        {/* Imagen izquierda */}
        <div style={s.imageCol}>
          <div style={s.imageWrap}>
            <div style={s.imageGlow} aria-hidden="true" />
            <img
              src={saludandoImg}
              alt="Bienvenida a ADS Veris"
              style={s.heroImg}
            />
            <div style={s.imageCard}>
              <span style={s.imageCardDot} />
              <span style={s.imageCardText}>Tu cuenta, tus herramientas</span>
            </div>
          </div>
        </div>

        {/* Formulario derecho */}
        <div style={s.formCol}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.eyebrow}>Bienvenido de vuelta</span>
              <h1 style={s.titulo}>Iniciar sesión</h1>
              <p style={s.subtitulo}>Accede a tus herramientas y planes ADS Veris.</p>
            </div>

            {errorGeneral && <div style={s.alertError}>{errorGeneral}</div>}

            <form onSubmit={handleSubmit} noValidate style={s.form}>
              <Campo
                label="Email"
                type="email"
                value={email}
                onChange={v => { setEmail(v); setErrores(p => ({ ...p, email: '' })) }}
                error={errores.email}
                placeholder="tu@email.com"
              />
              <Campo
                label="Contraseña"
                type="password"
                value={password}
                onChange={v => { setPassword(v); setErrores(p => ({ ...p, password: '' })) }}
                error={errores.password}
                placeholder="Tu contraseña"
              />

              <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>

            <div style={s.cardFooter}>
              <a href="/reset-password" style={s.linkMuted}>¿Olvidaste tu contraseña?</a>
              <a href="/register" style={s.linkGold}>Crear cuenta gratis →</a>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

function Campo({ label, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div style={s.campo}>
      <label style={s.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...s.input, ...(error ? s.inputError : {}) }}
        autoComplete={type === 'email' ? 'email' : 'current-password'}
      />
      {error && <span style={s.errorMsg}>{error}</span>}
    </div>
  )
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
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImg: { height: '34px', width: 'auto' },
  logoText: { fontSize: '17px', fontWeight: '700', color: '#f5f9fe', fontFamily: "'Sora', sans-serif" },
  logoGold: { color: '#c9a84c' },
  headerLink: { fontSize: '14px', color: '#ccd8ea' },
  headerLinkGold: { color: '#c9a84c', fontWeight: '600' },

  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    padding: '40px',
    gap: '60px',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  },

  imageCol: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '480px',
  },
  imageWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageGlow: {
    position: 'absolute',
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,154,84,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroImg: {
    maxHeight: '480px',
    maxWidth: '100%',
    objectFit: 'contain',
    position: 'relative',
    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))',
  },
  imageCard: {
    position: 'absolute',
    bottom: '20px',
    left: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(13,34,53,0.9)',
    border: '1px solid rgba(247,199,95,0.18)',
    borderRadius: '30px',
    padding: '8px 16px',
    backdropFilter: 'blur(10px)',
  },
  imageCardDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#43c59e',
    flexShrink: 0,
  },
  imageCardText: {
    fontSize: '12px',
    color: '#ccd8ea',
    fontWeight: '500',
  },

  formCol: {
    width: '420px',
    flexShrink: 0,
  },
  card: {
    background: 'rgba(9,28,45,0.85)',
    border: '1px solid rgba(199,168,106,0.18)',
    borderRadius: '16px',
    padding: '44px 40px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  cardHeader: { marginBottom: '28px' },
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
    fontSize: '26px',
    fontWeight: '800',
    color: '#f5f9fe',
    marginBottom: '8px',
    fontFamily: "'Sora', sans-serif",
  },
  subtitulo: { fontSize: '14px', color: '#8ba3bc', lineHeight: '1.5' },

  alertError: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#fca5a5',
  },

  form: { display: 'flex', flexDirection: 'column', gap: '0px' },

  campo: { display: 'flex', flexDirection: 'column', marginBottom: '18px' },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ccd8ea',
    marginBottom: '7px',
    letterSpacing: '0.02em',
  },
  input: {
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#f5f9fe',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  inputError: { borderColor: 'rgba(239,68,68,0.6)' },
  errorMsg: { color: '#fca5a5', fontSize: '12px', marginTop: '5px' },

  btn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #c19a54, #e0c589)',
    color: '#09111f',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s',
  },

  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(199,168,106,0.12)',
  },
  linkMuted: { fontSize: '13px', color: '#8ba3bc' },
  linkGold: { fontSize: '13px', color: '#c9a84c', fontWeight: '600' },
}
