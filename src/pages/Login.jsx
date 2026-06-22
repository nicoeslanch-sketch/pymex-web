import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Ingresa un email válido'
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
      const minutosRestantes = Math.ceil(
        (RATE_LIMIT_WINDOW_MS - (ahora - ventanaInicio.current)) / 60000
      )
      return `Demasiados intentos. Intenta en ${minutosRestantes} minuto${minutosRestantes !== 1 ? 's' : ''}.`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')

    const erroresValidacion = validar()
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    const rateLimitMsg = verificarRateLimit()
    if (rateLimitMsg) {
      setErrorGeneral(rateLimitMsg)
      return
    }

    setLoading(true)
    intentos.current += 1

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err) {
      setErrorGeneral(err.message || 'Email o contraseña incorrectos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Iniciar sesión</h1>

        {errorGeneral && <p style={styles.errorGeneral}>{errorGeneral}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrores(p => ({ ...p, email: '' })) }}
              style={{ ...styles.input, ...(errores.email ? styles.inputError : {}) }}
              placeholder="tu@email.com"
            />
            {errores.email && <span style={styles.error}>{errores.email}</span>}
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrores(p => ({ ...p, password: '' })) }}
              style={{ ...styles.input, ...(errores.password ? styles.inputError : {}) }}
              placeholder="Tu contraseña"
            />
            {errores.password && <span style={styles.error}>{errores.password}</span>}
          </div>

          <button type="submit" disabled={loading} style={styles.boton}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={styles.links}>
          <a href="/reset-password" style={styles.link}>
            ¿Olvidaste tu contraseña?
          </a>
          <a href="/register" style={styles.link}>
            ¿No tienes cuenta? Regístrate
          </a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#111',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    outline: 'none',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
  },
  errorGeneral: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  boton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
    alignItems: 'center',
  },
  link: {
    color: '#2563eb',
    fontSize: '14px',
    textDecoration: 'none',
  },
}
