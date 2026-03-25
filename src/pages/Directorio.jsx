import React, { useState } from 'react';

export default function Directorio({
  clientes, servicios, nuevoNombre, setNuevoNombre, nuevoEmail, setNuevoEmail,
  creando, crearCliente, eliminarCliente, actualizarCliente, // <-- ¡Nueva prop recibida!
  nuevoServicioNombre, setNuevoServicioNombre, nuevoServicioPrecio, setNuevoServicioPrecio, 
  creandoServicio, crearServicio, eliminarServicio, actualizarServicio, // <-- ¡Nueva prop recibida!
  configuracion, busquedaCliente, setBusquedaCliente, busquedaServicio, 
  setBusquedaServicio, clientesFiltrados, serviciosFiltrados
}) {
  
  // ESTADOS LOCALES PARA LA EDICIÓN EN LÍNEA
  const [editandoClienteId, setEditandoClienteId] = useState(null);
  const [editClienteNombre, setEditClienteNombre] = useState('');
  const [editClienteEmail, setEditClienteEmail] = useState('');

  const [editandoServicioId, setEditandoServicioId] = useState(null);
  const [editServicioNombre, setEditServicioNombre] = useState('');
  const [editServicioPrecio, setEditServicioPrecio] = useState('');

  // MANEJADORES DE EDICIÓN
  const iniciarEdicionCliente = (cliente) => {
    setEditandoClienteId(cliente.id);
    setEditClienteNombre(cliente.nombre_empresa);
    setEditClienteEmail(cliente.email);
  };

  const guardarEdicionCliente = async (id) => {
    const exito = await actualizarCliente(id, editClienteNombre, editClienteEmail);
    if (exito) setEditandoClienteId(null); // Cerramos el modo edición si guardó bien
  };

  const iniciarEdicionServicio = (servicio) => {
    setEditandoServicioId(servicio.id);
    setEditServicioNombre(servicio.nombre);
    setEditServicioPrecio(servicio.precio_base);
  };

  const guardarEdicionServicio = async (id) => {
    const exito = await actualizarServicio(id, editServicioNombre, editServicioPrecio);
    if (exito) setEditandoServicioId(null);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      
      {/* SECCIÓN DE FORMULARIOS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-green-500">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Nuevo Cliente</h3>
          <form onSubmit={crearCliente} className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Empresa" required className="w-full sm:w-1/3 p-2 border rounded-lg text-sm" />
            <input type="email" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} placeholder="Correo" required className="w-full sm:w-1/3 p-2 border rounded-lg text-sm" />
            <button type="submit" disabled={creando} className="w-full sm:w-1/3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-2 text-sm transition-colors">Añadir</button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-purple-500">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Nuevo Servicio</h3>
          <form onSubmit={crearServicio} className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={nuevoServicioNombre} onChange={e => setNuevoServicioNombre(e.target.value)} placeholder="Concepto" required className="w-full sm:w-1/2 p-2 border rounded-lg text-sm" />
            <input type="number" step="0.01" min="0" value={nuevoServicioPrecio} onChange={e => setNuevoServicioPrecio(e.target.value)} placeholder={`Precio (${configuracion.moneda})`} required className="w-full sm:w-1/4 p-2 border rounded-lg text-sm" />
            <button type="submit" disabled={creandoServicio} className="w-full sm:w-1/4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg py-2 text-sm transition-colors">Añadir</button>
          </form>
        </section>
      </div>

      {/* SECCIÓN DE LISTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LISTA DE CLIENTES */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800">📋 Mis Clientes</h3>
            <input type="text" placeholder="🔍 Buscar cliente..." value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} className="p-2 border rounded-lg text-sm w-full sm:w-48 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {clientesFiltrados.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No hay resultados.</p> : 
              clientesFiltrados.map(c => (
                <div key={c.id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100 group transition-all">
                  
                  {editandoClienteId === c.id ? (
                    /* MODO EDICIÓN */
                    <div className="flex flex-col sm:flex-row gap-2 w-full animate-fade-in">
                      <input type="text" value={editClienteNombre} onChange={e => setEditClienteNombre(e.target.value)} className="w-full p-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <input type="email" value={editClienteEmail} onChange={e => setEditClienteEmail(e.target.value)} className="w-full p-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => guardarEdicionCliente(c.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors" title="Guardar">💾</button>
                        <button onClick={() => setEditandoClienteId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors" title="Cancelar">❌</button>
                      </div>
                    </div>
                  ) : (
                    /* MODO LECTURA */
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{c.nombre_empresa}</p>
                        <p className="text-xs text-gray-500 break-all">{c.email}</p>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => iniciarEdicionCliente(c)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all" title="Editar">✏️</button>
                        <button onClick={() => eliminarCliente(c.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all" title="Eliminar">🗑️</button>
                      </div>
                    </div>
                  )}

                </div>
              ))
            }
          </div>
        </section>

        {/* LISTA DE SERVICIOS */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800">🛠️ Catálogo</h3>
            <input type="text" placeholder="🔍 Buscar servicio..." value={busquedaServicio} onChange={e => setBusquedaServicio(e.target.value)} className="p-2 border rounded-lg text-sm w-full sm:w-48 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {serviciosFiltrados.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No hay resultados.</p> : 
              serviciosFiltrados.map(s => (
                <div key={s.id} className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100 group transition-all">
                  
                  {editandoServicioId === s.id ? (
                    /* MODO EDICIÓN */
                    <div className="flex flex-col sm:flex-row gap-2 w-full animate-fade-in">
                      <input type="text" value={editServicioNombre} onChange={e => setEditServicioNombre(e.target.value)} className="w-full p-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      <input type="number" step="0.01" min="0" value={editServicioPrecio} onChange={e => setEditServicioPrecio(e.target.value)} className="w-full sm:w-24 p-2 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => guardarEdicionServicio(s.id)} className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors" title="Guardar">💾</button>
                        <button onClick={() => setEditandoServicioId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors" title="Cancelar">❌</button>
                      </div>
                    </div>
                  ) : (
                    /* MODO LECTURA */
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{s.nombre}</p>
                        <p className="font-black text-purple-600 text-sm">{configuracion.moneda}{parseFloat(s.precio_base).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => iniciarEdicionServicio(s)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all" title="Editar">✏️</button>
                        <button onClick={() => eliminarServicio(s.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all" title="Eliminar">🗑️</button>
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