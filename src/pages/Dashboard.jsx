import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null)
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarSesion() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (!session) {
          window.location.href = '/login'
          return
        }

        setUsuario(session.user)

        const authMetadata = metadataFromAuth(session.user)
        const { data, error: metaError } = await supabase
          .from('users_metadata')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        setMetadata(metaError ? authMetadata : { ...authMetadata, ...data })
      } catch (err) {
        setError(err.message || 'Error al cargar los datos.')
      } finally {
        setLoading(false)
      }
    }

    cargarSesion()
  }, [])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div style={styles.centrado}>
        <p style={styles.cargando}>Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.centrado}>
        <p style={styles.errorTexto}>{error}</p>
      </div>
    )
  }

  return (
    <div style={styles.pagina}>
      <header style={styles.header}>
        <h1 style={styles.bienvenida}>
          Hola, {metadata?.full_name?.split(' ')[0] || 'usuario'} 👋
        </h1>
        <button onClick={cerrarSesion} style={styles.botonLogout}>
          Cerrar sesión
        </button>
      </header>

      <main style={styles.main}>
        <section style={styles.seccion}>
          <h2 style={styles.subtitulo}>Tu perfil</h2>
          <div style={styles.tarjeta}>
            <Fila label="Nombre" valor={metadata?.full_name} />
            <Fila label="Email" valor={usuario?.email} />
            <Fila label="RUT" valor={metadata?.rut} />
            <Fila label="Plan" valor={metadata?.plan_id} badge />
          </div>
        </section>

        <section style={styles.seccion}>
          <h2 style={styles.subtitulo}>Próximamente</h2>
          <div style={styles.grid}>
            <TarjetaProxima
              icono="📊"
              titulo="Planillas"
              descripcion="Aquí verás tus compras de planillas"
            />
            <TarjetaProxima
              icono="🌐"
              titulo="Páginas web"
              descripcion="Aquí verás tus planes de página web"
            />
            <TarjetaProxima
              icono="📈"
              titulo="Análisis de datos"
              descripcion="Aquí verás tus análisis de datos"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function metadataFromAuth(user) {
  const data = user?.user_metadata || {}
  return {
    full_name: data.full_name || user?.email || '',
    rut: data.rut || '',
    phone: data.phone || '',
    plan_id: data.plan_id || 'free',
  }
}

function Fila({ label, valor, badge }) {
  return (
    <div style={styles.fila}>
      <span style={styles.filaLabel}>{label}</span>
      {badge ? (
        <span style={styles.badge}>{valor || '—'}</span>
      ) : (
        <span style={styles.filaValor}>{valor || '—'}</span>
      )}
    </div>
  )
}

function TarjetaProxima({ icono, titulo, descripcion }) {
  return (
    <div style={styles.tarjetaProxima}>
      <span style={styles.icono}>{icono}</span>
      <h3 style={styles.tarjetaTitulo}>{titulo}</h3>
      <p style={styles.tarjetaDesc}>{descripcion}</p>
    </div>
  )
}

const styles = {
  pagina: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bienvenida: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111',
    margin: 0,
  },
  botonLogout: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  seccion: {
    marginBottom: '40px',
  },
  subtitulo: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111',
    marginBottom: '16px',
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  fila: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  filaLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
  },
  filaValor: {
    fontSize: '15px',
    color: '#111',
    fontWeight: '400',
  },
  badge: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  tarjetaProxima: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    textAlign: 'center',
  },
  icono: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '10px',
  },
  tarjetaTitulo: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111',
    margin: '0 0 6px 0',
  },
  tarjetaDesc: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  centrado: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cargando: {
    color: '#6b7280',
    fontSize: '16px',
  },
  errorTexto: {
    color: '#ef4444',
    fontSize: '15px',
  },
}
