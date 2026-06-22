import { useState } from 'react'
import { supabase } from '../lib/supabase'

function validarRut(rut) {
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0
  let multiplier = 2
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
  const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return body.length > 0 ? `${bodyFormatted}-${dv}` : dv
}

export default function RegisterForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rut: '',
    telefono: '',
  })
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'rut') {
      setForm(prev => ({ ...prev, rut: formatearRut(value) }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
    setErrores(prev => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Ingresa un email válido'
    if (!form.password || form.password.length < 8)
      e.password = 'La contraseña debe tener al menos 8 caracteres'
    if (!form.rut.trim() || !validarRut(form.rut))
      e.rut = 'RUT inválido (formato: XX.XXX.XXX-K)'
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorGeneral('')
    const erroresValidacion = validar()
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion)
      return
    }

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })

      if (signUpError) throw signUpError

      const userId = data.user?.id
      if (userId) {
        const { error: metaError } = await supabase.from('users_metadata').insert({
          user_id: userId,
          full_name: `${form.nombre.trim()} ${form.apellido.trim()}`,
          rut: form.rut,
          phone: form.telefono,
          plan_id: 'free',
        })
        if (metaError) throw metaError
      }

      setSuccess(true)
    } catch (err) {
      setErrorGeneral(err.message || 'Error al registrarse. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <p style={styles.successText}>
              ✅ Email de confirmación enviado. Revisa tu bandeja.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>Crear cuenta</h1>

        {errorGeneral && <p style={styles.errorGeneral}>{errorGeneral}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.fila}>
            <Campo
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={errores.nombre}
            />
            <Campo
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              error={errores.apellido}
            />
          </div>

          <Campo
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errores.email}
          />

          <Campo
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errores.password}
            placeholder="Mínimo 8 caracteres"
          />

          <Campo
            label="RUT"
            name="rut"
            value={form.rut}
            onChange={handleChange}
            error={errores.rut}
            placeholder="12.345.678-K"
          />

          <Campo
            label="Teléfono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            error={errores.telefono}
            placeholder="+56912345678"
          />

          <button type="submit" disabled={loading} style={styles.boton}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p style={styles.linkTexto}>
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={styles.link}>
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}

function Campo({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div style={styles.campo}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
      />
      {error && <span style={styles.error}>{error}</span>}
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
    maxWidth: '480px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  titulo: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#111',
  },
  fila: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
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
    transition: 'border-color 0.2s',
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
  successBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    padding: '20px',
    textAlign: 'center',
  },
  successText: {
    color: '#15803d',
    fontSize: '15px',
    margin: 0,
  },
  linkTexto: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#555',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
}
