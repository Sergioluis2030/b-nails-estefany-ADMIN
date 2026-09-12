
import { useState } from 'react'
import logo from './assets/logo.jpg'

const mockReservas = [
  { id: 'res_001', nombre: 'Valeria Rojas', telefono: '+51 987 654 321', servicio: 'Uñas Acrílicas + Diseño', correo: 'valeria.rojas@gmail.com', fecha: '2026-09-12', horario: '10:00 AM', notas: 'Quiere diseño floral rosado, primera vez', fotoPago: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600', estado: 'pendiente' },
  { id: 'res_002', nombre: 'Camila Torres', telefono: '+51 912 345 678', servicio: 'Manicure Semipermanente', correo: 'camila.torres@hotmail.com', fecha: '2026-09-12', horario: '02:30 PM', notas: 'Cliente frecuente, color nude', fotoPago: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600', estado: 'pendiente' },
  { id: 'res_003', nombre: 'Luciana Mendoza', telefono: '+51 998 112 334', servicio: 'Pedicure Spa + Manicure', correo: 'luciana.m@outlook.com', fecha: '2026-09-13', horario: '11:00 AM', notas: 'Pago con Yape, enviar ubicación', fotoPago: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600', estado: 'completada' }
]
const mockClientesInit = [
  { id: 'cli_001', nombre: 'Luciana Mendoza', telefono: '+51 998 112 334', correo: 'luciana.m@outlook.com', visitas: 4, ultimoServicio: 'Pedicure Spa + Manicure', totalGastado: 'S/ 320' },
  { id: 'cli_002', nombre: 'Mariana Lopez', telefono: '+51 934 567 890', correo: 'mariana.l@gmail.com', visitas: 7, ultimoServicio: 'Uñas Acrílicas', totalGastado: 'S/ 540' },
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@estefanypalencia.com')
  const [pass, setPass] = useState('admin123')
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
            <form onSubmit={(e)=>{e.preventDefault(); onLogin({email})}} className="mt-8 space-y-5">
              <div><label className="text-[10px] font-bold tracking-[0.15em] text-[#7d5c32] uppercase">Correo administrador</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-2 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a47]" /></div>
              <div><label className="text-[10px] font-bold tracking-[0.15em] text-[#7d5c32] uppercase">Contraseña</label><input value={pass} onChange={e=>setPass(e.target.value)} type="password" className="mt-2 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#b88a47]" /></div>
              <button className="w-full bg-[#3f3322] hover:bg-[#2e2518] text-white rounded-xl py-3.5 font-semibold text-sm transition">Ingresar al Panel</button>
              <p className="text-[11px] text-[var(--text-secondary)] text-center">Demo frontend - listo para backend</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [view, setView] = useState('reservas')
  const [reservas, setReservas] = useState(mockReservas)
  const [clientes, setClientes] = useState(mockClientesInit)
  const [selected, setSelected] = useState(mockReservas[0])
  const [toast, setToast] = useState('')
  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000) }
  const completarReserva = (id) => { setReservas(prev => prev.map(r => r.id===id ? {...r, estado:'completada'} : r)); showToast('Reserva marcada como completada ✓') }
  const agregarCliente = (reserva) => {
    if (clientes.find(c=>c.correo===reserva.correo)) { showToast('Ya existe en clientes'); return }
    setClientes(prev=>[{ id: 'cli_'+Date.now(), nombre: reserva.nombre, telefono: reserva.telefono, correo: reserva.correo, visitas:1, ultimoServicio: reserva.servicio, totalGastado:'S/ 0'}, ...prev])
    showToast(`${reserva.nombre} agregada a clientes`)
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
                {reservas.map(r=>(
                  <button key={r.id} onClick={()=>setSelected(r)} className={`w-full text-left bg-[var(--bg-card)] rounded-2xl border p-4 transition ${selected?.id===r.id ? 'border-[#3f3322] shadow-md' : 'border-[var(--border-card)] hover:border-[#D1D5DB]'}`} style={{boxShadow: selected?.id===r.id ? '0 6px 16px rgba(0,0,0,0.08)' : 'var(--shadow-card)'}}>
                    <div className="flex justify-between items-start"><div><p className="font-semibold text-sm text-[var(--text-primary)]">{r.nombre}</p><p className="text-xs text-[var(--text-secondary)] mt-0.5">{r.servicio}</p></div><span className={`text-[10px] px-2 py-1 rounded-full font-bold tracking-wide ${r.estado==='pendiente' ? 'bg-[var(--badge-pendiente-bg)] text-[var(--badge-pendiente-text)]' : 'bg-[#DCFCE7] text-[#166534]'}`}>{r.estado.toUpperCase()}</span></div>
                    <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--text-secondary)]"><span>{r.fecha}</span><span>{r.horario}</span></div>
                  </button>
                ))}
              </div>
              {selected && (
                <div className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-card)] overflow-hidden" style={{boxShadow:'var(--shadow-card)'}}>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap gap-3 justify-between items-start"><div><h3 className="text-2xl font-bold text-[var(--text-primary)]">{selected.nombre}</h3><p className="text-sm text-[var(--text-secondary)] mt-1">{selected.servicio} • {selected.fecha} - {selected.horario}</p></div><div className="flex gap-2"><button onClick={()=>completarReserva(selected.id)} className="bg-[#166534] hover:bg-[#14532D] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">Reserva Completada</button><button onClick={()=>agregarCliente(selected)} className="bg-[#3f3322] hover:bg-[#2e2518] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">Agregar Cliente</button></div></div>
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
        ) : (
          <div className="p-4 md:p-8">
            <h2 className="text-[32px] font-bold text-[var(--text-primary)]">Clientes</h2><p className="text-sm text-[var(--text-secondary)] mt-1">Base de clientas convertidas desde reservas</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {clientes.map(c=>(
                <div key={c.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-5" style={{boxShadow:'var(--shadow-card)'}}>
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] flex items-center justify-center font-bold text-[#9c743b] text-sm">{c.nombre[0]}</div><div><p className="font-semibold text-sm text-[var(--text-primary)]">{c.nombre}</p><p className="text-xs text-[var(--text-secondary)]">{c.telefono}</p></div><span className="ml-auto text-[10px] bg-[var(--bg-app)] border border-[var(--border-card)] px-2 py-1 rounded-full text-[var(--text-secondary)]">{c.visitas} visitas</span></div>
                  <div className="mt-4 space-y-1 text-xs text-[var(--text-secondary)]"><p>{c.correo}</p><p>Último: {c.ultimoServicio}</p><p>Total: {c.totalGastado}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#2D2D2D] text-white text-sm px-5 py-3 rounded-full shadow-xl z-50">{toast}</div>}
      </main>
    </div>
  )
}
export default function App() {
  const [user, setUser] = useState(null)
  return user ? <Dashboard /> : <Login onLogin={setUser} />
}
