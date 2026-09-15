
import { useState, useEffect } from 'react'
import logo from './assets/logo.jpg'

const formatearFecha = (iso) => {
  if (!iso) return ''
  const f = new Date(iso)
  if (isNaN(f)) return String(iso).slice(0,10)
  return `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`
}
const formatearHora = (h) => {
  if (!h) return ''
  if (/AM|PM/i.test(h)) return h
  const [hh, mm] = String(h).split(':').map(Number)
  if (isNaN(hh)) return h
  const meridiano = hh >= 12 ? 'PM' : 'AM'
  const hora12 = hh % 12 === 0 ? 12 : hh % 12
  return `${hora12}:${String(mm).padStart(2,'0')} ${meridiano}`
}
const API_URL = import.meta.env.VITE_API_URL;
const normalizarReserva = (r) => ({ ...r, fecha: formatearFecha(r.fecha), horario: formatearHora(r.horario), fotoPago: r.fotoPago || r.fotoPagoUrl || (r.foto_pago_path ? API_URL + r.foto_pago_path : null) })
const normalizarCliente = (c) => ({ ...c, ultimoServicio: c.ultimo_servicio || c.ultimoServicio, totalGastado: c.total_gastado || c.totalGastado })

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@estefanypalencia.com')
  const [pass, setPass] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      })
      const data = await res.json().catch(()=>null)
      if (!res.ok) throw new Error(data?.message || data?.error || 'Credenciales inválidas')
      localStorage.setItem('token', data.token)
      onLogin({ email: data.admin?.email || email, token: data.token })
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex bg-[var(--bg-app)]">
      <div className="hidden lg:flex w-1/2 bg-[#fdfaf6] relative overflow-hidden p-12 flex-col justify-between border-r border-[var(--border-card)]">
        <img src={logo} alt="bg" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="relative z-10"><img src={logo} alt="Estefany Palencia" className="w-[180px] object-contain mix-blend-multiply" /></div>
        <div className="relative z-10">
          <h2 className="text-[46px] leading-[0.95] font-bold tracking-tight text-[var(--text-primary)]">Donde cada detalle<br/>se vuelve arte.</h2>
          <p className="mt-6 text-[var(--text-secondary)] max-w-md text-[15px]">Panel administrativo oficial de Estefany Palencia Studio Nails. Gestiona reservas, valida pagos y controla tu cartera de clientas.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8 text-center"><img src={logo} alt="logo" className="w-[160px] mx-auto mix-blend-multiply" /></div>
          <div className="bg-[var(--bg-card)] rounded-[28px] p-8 border border-[var(--border-card)]" style={{boxShadow:'var(--shadow-card)'}}>
            <h3 className="text-[22px] font-bold text-[var(--text-primary)]">Bienvenida, Estefany</h3>
            <p className="text-[var(--text-secondary)] text-sm mt-2">Inicia sesión como administradora</p>
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div><label className="text-[10px] font-bold tracking-[0.15em] text-[#7d5c32] uppercase">Correo administrador</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a47]" /></div>
              <div><label className="text-[10px] font-bold tracking-[0.15em] text-[#7d5c32] uppercase">Contraseña</label><input value={pass} onChange={e=>setPass(e.target.value)} type="password" className="mt-2 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a47]" /></div>
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
              <button disabled={loading} className="w-full bg-[#3f3322] hover:bg-[#2e2518] disabled:opacity-60 text-white rounded-xl py-3.5 font-semibold text-sm transition">{loading ? 'Ingresando...' : 'Ingresar al Panel'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function Calendario({ token, completadas }) {
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [detalle, setDetalle] = useState(null)
  const [citas, setCitas] = useState([])
  const [loadingCitas, setLoadingCitas] = useState(true)
  const [errorCitas, setErrorCitas] = useState('')
  const [msgCliente, setMsgCliente] = useState('')
  const [msgClienteError, setMsgClienteError] = useState(false)
  const [agregandoCliente, setAgregandoCliente] = useState(false)
  const agregarCliente = async () => {
    const tokenFinal = token || localStorage.getItem('token') || ''
    setAgregandoCliente(true)
    setMsgCliente('')
    setMsgClienteError(false)
    try {
      const res = await fetch(`${API_URL}/api/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFinal}` },
        body: JSON.stringify({ nombre: detalle?.nombre, telefono: detalle?.telefono, correo: detalle?.correo, servicio: detalle?.servicio })
      })
      const data = await res.json().catch(()=>null)
      if (res.status === 409) { setMsgCliente(data?.error || 'Cliente ya existe'); setMsgClienteError(true); return }
      if (!res.ok) throw new Error()
      setMsgCliente('Cliente agregada ✓')
    } catch (err) {
      setMsgClienteError(true)
      setMsgCliente('No se pudo agregar el cliente')
    } finally {
      setAgregandoCliente(false)
    }
  }
  const y = month.getFullYear()
  const m = month.getMonth()
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const diasSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  const fechaKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  const offset = (new Date(y, m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(y, m+1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()
  const celdas = []
  for (let i = 0; i < offset; i++) celdas.push({ d: prevDays - offset + 1 + i, other: true, yy: (m===0 ? y-1 : y), mm: (m+11)%12 })
  for (let d = 1; d <= daysInMonth; d++) celdas.push({ d, other: false, yy: y, mm: m })
  const pad = (7 - (celdas.length % 7)) % 7
  for (let d = 1; d <= pad; d++) celdas.push({ d, other: true, yy: (m===11 ? y+1 : y), mm: (m+1)%12 })
  const hoyKey = fechaKey(new Date())
  useEffect(() => {
    let activo = true
    setLoadingCitas(true)
    setErrorCitas('')
    const tokenFinal = token || localStorage.getItem('token') || ''
    const mesKey = `${y}-${String(m+1).padStart(2,'0')}`
    fetch(`http://localhost:3001/api/reservas/calendario?mes=${mesKey}`, { headers: { Authorization: `Bearer ${tokenFinal}` } })
      .then(async res => {
        const data = await res.json().catch(()=>null)
        if (!activo) return
        if (!res.ok) { setErrorCitas('No se pudieron cargar las citas'); return }
        const arr = Array.isArray(data) ? data : (data?.citas || data?.reservas || [])
        setCitas(arr.map(normalizarReserva))
      })
      .catch(()=>{ if (activo) setErrorCitas('No se pudieron cargar las citas') })
      .finally(()=>{ if (activo) setLoadingCitas(false) })
    return () => { activo = false }
  }, [y, m])
  const todas = [...citas, ...completadas.filter(c => !citas.some(x => x.id === c.id))]
  const cambiaMes = (offset) => { setDetalle(null); setMonth(new Date(y, m+offset, 1)) }

  return (
    <>
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div><h2 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Calendario</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Citas completadas y confirmadas por día</p></div>
        <div className="flex items-center gap-2">
          <button onClick={()=>cambiaMes(-1)} className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold hover:border-[#b88a47]" style={{boxShadow:'var(--shadow-card)'}}>←</button>
          <span className="min-w-[150px] text-center text-sm font-bold text-[var(--text-primary)]">{meses[m]} {y}</span>
          <button onClick={()=>cambiaMes(1)} className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold hover:border-[#b88a47]" style={{boxShadow:'var(--shadow-card)'}}>→</button>
          <button onClick={()=>{ setDetalle(null); const n = new Date(); setMonth(new Date(n.getFullYear(), n.getMonth(), 1)) }} className="ml-2 rounded-full bg-[#3f3322] hover:bg-[#2e2518] text-white text-xs font-bold px-4 py-2 transition">Hoy</button>
        </div>
      </div>
      <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-card)] p-4 md:p-6" style={{boxShadow:'var(--shadow-card)'}}>
        <div className="flex items-center gap-2 mb-3">
          {loadingCitas && <span className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-app)] border border-[var(--border-card)] rounded-full px-3 py-1">Cargando citas...</span>}
          {!loadingCitas && errorCitas && <span className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1">{errorCitas}</span>}
          {!loadingCitas && !errorCitas && <span className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-app)] border border-[var(--border-card)] rounded-full px-3 py-1">{todas.length} cita(s) en {meses[m]}</span>}
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {diasSemana.map((d,i)=>(
            <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)] py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {celdas.map((c,i)=>{
            const key = fechaKey(new Date(c.yy, c.mm, c.d))
            const diaCitas = todas.filter(r => r.fecha === key)
            const hoy = key === hoyKey
            return (
              <div key={i} className={`min-h-[88px] md:min-h-[110px] rounded-xl border p-1.5 md:p-2 flex flex-col ${c.other ? 'bg-[var(--bg-app)] border-transparent' : (hoy ? 'border-[#b88a47] bg-[#fffdf8]' : 'border-[var(--border-card)] bg-[var(--bg-card)]')}`}>
                <span className={`text-[11px] md:text-xs font-bold ${c.other ? 'text-[var(--text-secondary)]/50' : hoy ? 'text-[#9c743b]' : 'text-[var(--text-primary)]'}`}>{c.d}</span>
                <div className="mt-1 space-y-1 overflow-hidden">
                  {!c.other && diaCitas.map(cita=>(
                    <button key={cita.id} onClick={()=>setDetalle(cita)} className="w-full text-left truncate rounded-md bg-[#DCFCE7] px-1.5 py-1 text-[9px] md:text-[10px] font-semibold text-[#166534] hover:bg-[#BBF7D0] transition">
                      <span className="block truncate">{cita.nombre}</span>
                      <span className="opacity-75">{cita.horario}</span>
                    </button>
                  ))}
                  {!c.other && !loadingCitas && diaCitas.length===0 && <p className="text-[9px] text-[var(--text-secondary)]/60 hidden md:block">Sin citas</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/40 backdrop-blur-sm" onClick={()=>setDetalle(null)}>
          <div className="bg-[var(--bg-card)] w-full sm:max-w-2xl rounded-t-[28px] sm:rounded-[28px] border border-[var(--border-card)] overflow-hidden max-h-[90vh] flex flex-col" style={{boxShadow:'0 20px 50px rgba(0,0,0,0.25)'}} onClick={e=>e.stopPropagation()}>
            <div className="p-5 md:p-6 border-b border-[var(--border-card)] flex items-start justify-between gap-3">
              <div><h3 className="text-xl font-bold text-[var(--text-primary)]">{detalle.nombre}</h3><p className="text-sm text-[var(--text-secondary)] mt-1">{detalle.servicio} • {detalle.fecha} - {detalle.horario}</p></div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-[#DCFCE7] text-[#166534] text-[10px] px-2 py-1 rounded-full font-bold tracking-wide">{detalle.estado.toUpperCase()}</span>
                <button onClick={agregarCliente} disabled={agregandoCliente} className="bg-[#3f3322] hover:bg-[#2e2518] disabled:opacity-60 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition">{agregandoCliente ? 'Agregando...' : 'Agregar Cliente'}</button>
                <button onClick={()=>setDetalle(null)} className="w-8 h-8 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-secondary)] font-bold hover:opacity-70">✕</button>
              </div>
            </div>
            <div className="p-5 md:p-6 overflow-y-auto">
              {msgCliente && <p className={`text-xs mb-4 rounded-xl px-3 py-2 ${msgClienteError ? 'text-red-600 bg-red-50 border border-red-100' : 'text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0]'}`}>{msgCliente}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4"><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Datos de la cita</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Nombre</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.nombre}</p></div>
                    {detalle.telefono && <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Teléfono</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.telefono}</p></div>}
                    {detalle.correo && <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Correo</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.correo}</p></div>}
                    <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Servicio</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.servicio}</p></div>
                    <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Fecha</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.fecha}</p></div>
                    <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Horario</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{detalle.horario}</p></div>
                    {detalle.notas && <div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Notas</p><p className="mt-1 bg-[var(--bg-app)] rounded-xl p-3 text-[var(--text-primary)] text-sm border border-[var(--border-card)]">{detalle.notas}</p></div>}
                  </div>
                </div>
                {detalle.fotoPago && <div><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Comprobante de pago</h4><p className="text-[11px] text-[var(--text-secondary)] mt-1">Foto enviada desde el formulario</p><div className="mt-3 rounded-2xl overflow-hidden border border-[var(--border-card)] bg-[var(--bg-app)] aspect-[4/5]"><img src={detalle.fotoPago} alt="Comprobante" className="w-full h-full object-cover" /></div></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Dashboard({ token }) {
  const [view, setView] = useState('reservas')
  const [reservas, setReservas] = useState([])
  const [completadas, setCompletadas] = useState([])
  const [clientes, setClientes] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')
  const [leaving, setLeaving] = useState(null)
  const [loadingReservas, setLoadingReservas] = useState(true)
  const [errorReservas, setErrorReservas] = useState('')
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [errorClientes, setErrorClientes] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [paginaClientes, setPaginaClientes] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalClientes, setTotalClientes] = useState(0)
  useEffect(() => {
    const tokenFinal = token || localStorage.getItem('token') || ''
    fetch('http://localhost:3001/api/reservas', { headers: { Authorization: `Bearer ${tokenFinal}` } })
      .then(async res => {
        const data = await res.json().catch(()=>null)
        if (!res.ok) { setErrorReservas('No se pudieron cargar las reservas'); return }
        const arr = Array.isArray(data) ? data : (data?.reservas || [])
        setReservas(arr.filter(r=>r.estado==='pendiente').map(normalizarReserva))
      })
      .catch(()=>setErrorReservas('No se pudieron cargar las reservas'))
      .finally(()=>setLoadingReservas(false))
  }, [])
  useEffect(() => {
    const tokenFinal = token || localStorage.getItem('token') || ''
    setLoadingClientes(true)
    setErrorClientes('')
    const url = `${API_URL}/api/clientes?page=${paginaClientes}${busqueda.trim() ? `&q=${encodeURIComponent(busqueda.trim())}` : ''}`
    fetch(url, { headers: { Authorization: `Bearer ${tokenFinal}` } })
      .then(async res => {
        const data = await res.json().catch(()=>null)
        if (!res.ok) { setErrorClientes('No se pudieron cargar los clientes'); return }
        if (Array.isArray(data)) {
          setClientes(data.map(normalizarCliente))
          setTotalPaginas(1)
          setTotalClientes(data.length)
        } else {
          setClientes((data?.clientes || []).map(normalizarCliente))
          setTotalPaginas(data?.totalPaginas || 1)
          setTotalClientes(data?.total || 0)
        }
      })
      .catch(()=>setErrorClientes('No se pudieron cargar los clientes'))
      .finally(()=>setLoadingClientes(false))
  }, [paginaClientes, busqueda])
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000) }
  const completarReserva = async (id) => {
    const reserva = reservas.find(r => r.id === id)
    const tokenFinal = token || localStorage.getItem('token') || ''
    try {
      const res = await fetch(`http://localhost:3001/api/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenFinal}` },
        body: JSON.stringify({ estado: 'completada' })
      })
      if (!res.ok) throw new Error()
      setReservas(prev => prev.map(r => r.id===id ? {...r, estado:'completada'} : r))
      if (reserva && !completadas.find(c=>c.id===id)) setCompletadas(prev => [...prev, { ...reserva, estado: 'completada' }])
      showToast('Reserva confirmada ✓')
      setTimeout(()=>{ setLeaving(id); setTimeout(()=>{ setReservas(prev=>prev.filter(r=>r.id!==id)); setSelected(prev=>prev?.id===id ? null : prev) }, 800) }, 2000)
    } catch (err) {
      showToast('No se pudo confirmar la reserva')
    }
  }
  const eliminarReserva = async (id) => {
    const tokenFinal = token || localStorage.getItem('token') || ''
    try {
      const res = await fetch(`http://localhost:3001/api/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tokenFinal}` }
      })
      if (!res.ok) throw new Error()
      setReservas(prev => prev.filter(r => r.id!==id))
      setSelected(prev => prev?.id===id ? null : prev)
      showToast('Reserva eliminada')
    } catch (err) {
      showToast('No se pudo eliminar la reserva')
    }
  }
  const pendientes = reservas.filter(r=>r.estado==='pendiente').length

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex">
      <aside className="hidden md:flex w-[280px] bg-[var(--bg-card)] border-r border-[var(--border-card)] flex-col p-7 fixed h-screen">
        <img src={logo} alt="logo" className="w-[170px] mix-blend-multiply -ml-2" />
        <nav className="mt-10 space-y-2">
          <button onClick={()=>setView('reservas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${view==='reservas' ? 'bg-[#3f3322] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'}`}>
            Reservas {pendientes>0 && <span className="ml-auto bg-[#b88a47] text-white text-[10px] px-2 py-0.5 rounded-full">{pendientes}</span>}
          </button>
          <button onClick={()=>setView('clientes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${view==='clientes' ? 'bg-[#3f3322] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'}`}>Clientes</button>
          <button onClick={()=>setView('calendario')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${view==='calendario' ? 'bg-[#3f3322] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)]'}`}>Calendario</button>
        </nav>
        <div className="mt-auto">
          <button onClick={()=>window.location.reload()} className="mt-4 w-full text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 md:ml-[280px]">
        <div className="md:hidden bg-[var(--bg-card)] border-b border-[var(--border-card)] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <img src={logo} alt="logo" className="h-10 mix-blend-multiply" />
          <div className="flex gap-2">
            <button onClick={()=>setView('reservas')} className={`px-3 py-2 rounded-lg text-xs font-bold ${view==='reservas'?'bg-[#3f3322] text-white':'bg-[var(--bg-app)] text-[var(--text-secondary)]'}`}>Reservas</button>
            <button onClick={()=>setView('clientes')} className={`px-3 py-2 rounded-lg text-xs font-bold ${view==='clientes'?'bg-[#3f3322] text-white':'bg-[var(--bg-app)] text-[var(--text-secondary)]'}`}>Clientes</button>
            <button onClick={()=>setView('calendario')} className={`px-3 py-2 rounded-lg text-xs font-bold ${view==='calendario'?'bg-[#3f3322] text-white':'bg-[var(--bg-app)] text-[var(--text-secondary)]'}`}>Calendario</button>
          </div>
        </div>

        {view==='reservas' ? (
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-6">
              <div><h2 className="text-[32px] font-bold text-[var(--text-primary)] tracking-tight">Reservas</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Valida el pago, confirma la cita y convierte en clienta</p></div>
              <div className="flex gap-2"><span className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>Pendientes: {pendientes}</span><span className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>Total: {reservas.length}</span></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
              <div className="space-y-3">
                {loadingReservas && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>Cargando reservas...</div>}
                {!loadingReservas && errorReservas && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-red-600" style={{boxShadow:'var(--shadow-card)'}}>{errorReservas}</div>}
                {!loadingReservas && !errorReservas && reservas.length===0 && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>No hay reservas pendientes</div>}
                {reservas.map(r=>(
                  <button key={r.id} onClick={()=>setSelected(r)} className={`w-full text-left bg-[var(--bg-card)] rounded-2xl border p-4 transition-all duration-500 opacity-100 ${leaving===r.id ? 'opacity-0 translate-y-2' : ''} ${selected?.id===r.id ? 'border-[#3f3322] shadow-md' : 'border-[var(--border-card)] hover:border-[#D1D5DB]'}`} style={{boxShadow: selected?.id===r.id ? '0 6px 16px rgba(0,0,0,0.08)' : 'var(--shadow-card)'}}>
                    <div className="flex justify-between items-start"><div><p className="font-semibold text-sm text-[var(--text-primary)]">{r.nombre}</p><p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.servicio}</p></div><span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-wide ${r.estado==='pendiente' ? 'bg-[var(--badge-pendiente-bg)] text-[var(--badge-pendiente-text)]' : 'bg-[#DCFCE7] text-[#166534]'}`}>{r.estado.toUpperCase()}</span></div>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--text-secondary)]"><span>{r.fecha}</span><span>{r.horario}</span></div>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-card)] overflow-hidden" style={{boxShadow:'var(--shadow-card)'}}>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-3 justify-between items-start"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">{selected.nombre}</h3><p className="text-sm text-[var(--text-secondary)] mt-1">{selected.servicio} • {selected.fecha} - {selected.horario}</p></div><div className="flex gap-2"><button onClick={()=>completarReserva(selected.id)} className="bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">Confirmar Reserva</button><button onClick={()=>eliminarReserva(selected.id)} className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">Eliminar Reserva</button></div></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-4"><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Datos del formulario</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Nombre</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.nombre}</p></div>
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Teléfono</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.telefono}</p></div>
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Correo</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.correo}</p></div>
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Servicio</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.servicio}</p></div>
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Fecha</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.fecha}</p></div>
                          <div className="flex justify-between gap-4 border-b border-[var(--border-card)] pb-2"><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Horario</p><p className="text-[var(--text-primary)] font-medium text-right text-sm">{selected.horario}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-secondary)]">Notas</p><p className="mt-1 bg-[var(--bg-app)] rounded-xl p-3 text-[var(--text-primary)] text-sm border border-[var(--border-card)]">{selected.notas}</p></div>
                        </div>
                      </div>
                      <div><h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Comprobante de pago</h4><p className="text-[11px] text-[var(--text-secondary)] mt-1">Foto enviada desde el formulario</p><div className="mt-3 rounded-2xl overflow-hidden border border-[var(--border-card)] bg-[var(--bg-app)] aspect-[4/5]"><img src={selected.fotoPago} alt="Comprobante" className="w-full h-full object-cover" /></div></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : view==='clientes' ? (
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
              <div><h2 className="text-[32px] font-bold text-[var(--text-primary)]">Clientes</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Base de clientas convertidas desde reservas</p></div>
            </div>
            <input value={busqueda} onChange={e=>{ setBusqueda(e.target.value); setPaginaClientes(1) }} type="text" placeholder="Buscar por nombre o teléfono..." className="w-full max-w-md mb-5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a47]" style={{boxShadow:'var(--shadow-card)'}} />
            <div className="mb-4">
              {loadingClientes && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>Cargando clientes...</div>}
              {!loadingClientes && errorClientes && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-red-600" style={{boxShadow:'var(--shadow-card)'}}>{errorClientes}</div>}
              {!loadingClientes && !errorClientes && clientes.length===0 && <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-6 text-center text-sm text-[var(--text-secondary)]" style={{boxShadow:'var(--shadow-card)'}}>{busqueda ? 'Sin resultados para la búsqueda' : 'No hay clientes registrados'}</div>}
            </div>
            {!loadingClientes && !errorClientes && clientes.length>0 && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] overflow-hidden" style={{boxShadow:'var(--shadow-card)'}}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wide text-[var(--text-secondary)] border-b border-[var(--border-card)]">
                        <th className="px-5 py-3 font-bold">Nombre</th>
                        <th className="px-5 py-3 font-bold">Teléfono</th>
                        <th className="px-5 py-3 font-bold">Correo</th>
                        <th className="px-5 py-3 font-bold">Último servicio</th>
                        <th className="px-5 py-3 font-bold text-center">Visitas</th>
                        <th className="px-5 py-3 font-bold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map(c=>(
                        <tr key={c.id} className="border-b border-[var(--border-card)] last:border-0 hover:bg-[var(--bg-app)]">
                          <td className="px-5 py-3.5"><p className="font-semibold text-[var(--text-primary)]">{c.nombre}</p></td>
                          <td className="px-5 py-3.5 text-[var(--text-secondary)]">{c.telefono}</td>
                          <td className="px-5 py-3.5 text-[var(--text-secondary)]">{c.correo}</td>
                          <td className="px-5 py-3.5 text-[var(--text-secondary)]">{c.ultimoServicio}</td>
                          <td className="px-5 py-3.5 text-center"><span className="inline-block bg-[var(--bg-app)] border border-[var(--border-card)] px-2.5 py-1 rounded-full text-[10px] font-bold text-[var(--text-secondary)]">{c.visitas}</span></td>
                          <td className="px-5 py-3.5 text-right font-semibold text-[#9c743b]">{c.totalGastado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!loadingClientes && !errorClientes && totalPaginas>1 && (() => {
              const paginas = []
              const desde = Math.max(1, paginaClientes-2)
              const hasta = Math.min(totalPaginas, paginaClientes+2)
              for (let n = desde; n <= hasta; n++) paginas.push(n)
              return (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-[var(--text-secondary)]">Página {paginaClientes} de {totalPaginas} • {totalClientes} clientes en total</p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={()=>setPaginaClientes(p=>Math.max(1,p-1))} disabled={paginaClientes<=1} className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold hover:border-[#b88a47] disabled:opacity-40" style={{boxShadow:'var(--shadow-card)'}}>←</button>
                    {paginas.map(n=>(
                      <button key={n} onClick={()=>setPaginaClientes(n)} className={`w-9 h-9 rounded-full text-xs font-bold transition ${n===paginaClientes ? 'bg-[#3f3322] text-white' : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-secondary)] hover:border-[#b88a47]'}`} style={{boxShadow: n===paginaClientes ? 'none' : 'var(--shadow-card)'}}>{n}</button>
                    ))}
                    <button onClick={()=>setPaginaClientes(p=>Math.min(totalPaginas,p+1))} disabled={paginaClientes>=totalPaginas} className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-primary)] font-bold hover:border-[#b88a47] disabled:opacity-40" style={{boxShadow:'var(--shadow-card)'}}>→</button>
                  </div>
                </div>
              )
            })()}
          </div>
        ) : (
          <Calendario token={token} completadas={completadas} />
        )}
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-white text-sm px-5 py-3 rounded-full shadow-xl z-50">{toast}</div>}
      </main>
    </div>
  )
}
export default function App() {
  const [user, setUser] = useState(null)
  return user ? <Dashboard token={user.token} /> : <Login onLogin={setUser} />
}
