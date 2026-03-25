import React, { useState } from 'react';

export default function Directorio({
  clientes, servicios, nuevoNombre, setNuevoNombre, nuevoEmail, setNuevoEmail, creando, crearCliente, eliminarCliente, actualizarCliente,
  nuevoServicioNombre, setNuevoServicioNombre, nuevoServicioPrecio, setNuevoServicioPrecio, creandoServicio, crearServicio, eliminarServicio, actualizarServicio,
  configuracion, busquedaCliente, setBusquedaCliente, busquedaServicio, setBusquedaServicio, clientesFiltrados, serviciosFiltrados
}) {
  const [editandoClienteId, setEditandoClienteId] = useState(null);
  const [editClienteNombre, setEditClienteNombre] = useState('');
  const [editClienteEmail, setEditClienteEmail] = useState('');
  const [editandoServicioId, setEditandoServicioId] = useState(null);
  const [editServicioNombre, setEditServicioNombre] = useState('');
  const [editServicioPrecio, setEditServicioPrecio] = useState('');

  const iniciarEdicionCliente = (c) => { setEditandoClienteId(c.id); setEditClienteNombre(c.nombre_empresa); setEditClienteEmail(c.email); };
  const guardarEdicionCliente = async (id) => { const exito = await actualizarCliente(id, editClienteNombre, editClienteEmail); if (exito) setEditandoClienteId(null); };
  const iniciarEdicionServicio = (s) => { setEditandoServicioId(s.id); setEditServicioNombre(s.nombre); setEditServicioPrecio(s.precio_base); };
  const guardarEdicionServicio = async (id) => { const exito = await actualizarServicio(id, editServicioNombre, editServicioPrecio); if (exito) setEditandoServicioId(null); };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20 border-t-4 border-t-green-400">
          <h3 className="text-sm font-bold text-atomTexto uppercase mb-4">Nuevo Cliente</h3>
          <form onSubmit={crearCliente} className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Empresa" required className="w-full sm:w-1/3 p-2 rounded-lg text-sm outline-none" />
            <input type="email" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} placeholder="Correo" required className="w-full sm:w-1/3 p-2 rounded-lg text-sm outline-none" />
            <button type="submit" disabled={creando} className="w-full sm:w-1/3 bg-green-500/20 hover:bg-green-500 border border-green-500 text-green-400 hover:text-white font-bold rounded-lg py-2 text-sm transition-colors">Añadir</button>
          </form>
        </section>

        <section className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20 border-t-4 border-t-purple-400">
          <h3 className="text-sm font-bold text-atomTexto uppercase mb-4">Nuevo Servicio</h3>
          <form onSubmit={crearServicio} className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={nuevoServicioNombre} onChange={e => setNuevoServicioNombre(e.target.value)} placeholder="Concepto" required className="w-full sm:w-1/2 p-2 rounded-lg text-sm outline-none" />
            <input type="number" step="0.01" min="0" value={nuevoServicioPrecio} onChange={e => setNuevoServicioPrecio(e.target.value)} placeholder={`Precio`} required className="w-full sm:w-1/4 p-2 rounded-lg text-sm outline-none" />
            <button type="submit" disabled={creandoServicio} className="w-full sm:w-1/4 bg-purple-500/20 hover:bg-purple-500 border border-purple-500 text-purple-400 hover:text-white font-bold rounded-lg py-2 text-sm transition-colors">Añadir</button>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-atomTitulo font-titulos">📋 Clientes</h3>
            <input type="text" placeholder="🔍 Buscar..." value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} className="p-2 rounded-lg text-sm w-full sm:w-48 outline-none" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {clientesFiltrados.length === 0 ? <p className="text-sm text-atomTexto text-center">No hay resultados.</p> : 
              clientesFiltrados.map(c => (
                <div key={c.id} className="bg-atomFondo/50 p-3 sm:p-4 rounded-xl border border-gray-800 hover:border-atomAcento/50 group transition-all">
                  {editandoClienteId === c.id ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full animate-fade-in">
                      <input type="text" value={editClienteNombre} onChange={e => setEditClienteNombre(e.target.value)} className="w-full p-2 border border-blue-500 rounded-lg text-sm outline-none" />
                      <input type="email" value={editClienteEmail} onChange={e => setEditClienteEmail(e.target.value)} className="w-full p-2 border border-blue-500 rounded-lg text-sm outline-none" />
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => guardarEdicionCliente(c.id)} className="bg-green-500/20 text-green-400 p-2 rounded-lg">💾</button>
                        <button onClick={() => setEditandoClienteId(null)} className="bg-gray-800 text-white p-2 rounded-lg">❌</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <div><p className="font-bold text-sm text-atomTitulo">{c.nombre_empresa}</p><p className="text-xs text-atomTexto break-all">{c.email}</p></div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => iniciarEdicionCliente(c)} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-lg">✏️</button>
                        <button onClick={() => eliminarCliente(c.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </section>

        <section className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-atomTitulo font-titulos">🛠️ Catálogo</h3>
            <input type="text" placeholder="🔍 Buscar..." value={busquedaServicio} onChange={e => setBusquedaServicio(e.target.value)} className="p-2 rounded-lg text-sm w-full sm:w-48 outline-none" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {serviciosFiltrados.length === 0 ? <p className="text-sm text-atomTexto text-center">No hay resultados.</p> : 
              serviciosFiltrados.map(s => (
                <div key={s.id} className="bg-atomFondo/50 p-3 sm:p-4 rounded-xl border border-gray-800 hover:border-atomAcento/50 group transition-all">
                  {editandoServicioId === s.id ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full animate-fade-in">
                      <input type="text" value={editServicioNombre} onChange={e => setEditServicioNombre(e.target.value)} className="w-full p-2 border border-purple-500 rounded-lg text-sm outline-none" />
                      <input type="number" step="0.01" min="0" value={editServicioPrecio} onChange={e => setEditServicioPrecio(e.target.value)} className="w-full sm:w-24 p-2 border border-purple-500 rounded-lg text-sm outline-none" />
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => guardarEdicionServicio(s.id)} className="bg-green-500/20 text-green-400 p-2 rounded-lg">💾</button>
                        <button onClick={() => setEditandoServicioId(null)} className="bg-gray-800 text-white p-2 rounded-lg">❌</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <div><p className="font-bold text-sm text-atomTitulo">{s.nombre}</p><p className="font-black text-atomAcento text-sm">{configuracion.moneda}{parseFloat(s.precio_base).toFixed(2)}</p></div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => iniciarEdicionServicio(s)} className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-lg">✏️</button>
                        <button onClick={() => eliminarServicio(s.id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg">🗑️</button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}