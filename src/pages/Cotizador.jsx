import React from 'react';

export default function Cotizador({
  clientes,
  clienteSeleccionado,
  setClienteSeleccionado,
  servicios,
  servicioSeleccionado,
  setServicioSeleccionado,
  configuracion,
  cantidad,
  setCantidad,
  agregarItemACotizacion,
  itemsCotizacion,
  totalCotizacion,
  guardarCotizacionOficial,
  guardandoCotizacion,
  cotizacionEnEdicion,
  cancelarEdicion,
  eliminarItemCotizacion,
  descuento,         // <--- ¡AQUÍ ESTÁ!
  setDescuento       // <--- ¡Y AQUÍ!
}) {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* TÍTULO DINÁMICO */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {cotizacionEnEdicion ? '✏️ Editando Cotización' : 'Nueva Cotización'}
      </h2>
      
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        
        {/* SELECCIÓN DE CLIENTE */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Selecciona el Cliente Destino:</label>
          <select 
            value={clienteSeleccionado} 
            onChange={(e) => setClienteSeleccionado(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none"
          >
            <option value="">-- Buscar cliente en directorio --</option>
            {Array.isArray(clientes) && clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>{cliente.nombre_empresa}</option>
            ))}
          </select>
        </div>

        {/* SELECCIÓN DE SERVICIOS */}
        <form onSubmit={agregarItemACotizacion} className="flex flex-col sm:flex-row gap-4 items-end bg-blue-50/50 p-4 sm:p-6 rounded-xl border border-blue-100 mb-8">
          <div className="flex-[2] w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">2. Añadir Servicio:</label>
            <select 
              value={servicioSeleccionado} 
              onChange={(e) => setServicioSeleccionado(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none" 
              required
            >
              <option value="">-- Catálogo de servicios --</option>
              {Array.isArray(servicios) && servicios.map(servicio => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre} ({configuracion.moneda}{servicio.precio_base})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad:</label>
            <input 
              type="number" 
              min="1" 
              value={cantidad} 
              onChange={(e) => setCantidad(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none" 
              required 
            />
          </div>
          <button type="submit" className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
            + Añadir
          </button>
        </form>

        {/* VISTA PREVIA Y TOTALES */}
        {itemsCotizacion.length > 0 && (
          <div className="border-t border-gray-200 pt-6 sm:pt-8 mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Vista Previa de Conceptos</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-3 rounded-l-lg">Servicio</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Cant.</th>
                    <th className="p-3 rounded-r-lg text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itemsCotizacion.map(item => (
                    <tr key={item.id_temporal}>
                      <td className="p-3 font-medium text-gray-800 text-sm">{item.nombre}</td>
                      <td className="p-3 text-gray-600 text-sm">{configuracion.moneda}{item.precio.toFixed(2)}</td>
                      <td className="p-3 text-gray-600 text-sm">{item.cantidad}</td>
                      {/* BOTÓN "X" PARA QUITAR UN SERVICIO */}
                      <td className="p-3 font-bold text-gray-900 text-sm text-right flex justify-end items-center gap-3">
                        {configuracion.moneda}{item.subtotal.toFixed(2)}
                        <button type="button" onClick={() => eliminarItemCotizacion(item.id_temporal)} className="text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors" title="Quitar servicio">
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-200">
                  <label className="text-sm font-bold text-gray-700">Descuento Global (%):</label>
                  <input type="number" min="0" max="100" value={descuento} onChange={(e) => setDescuento(e.target.value)} className="w-20 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center font-bold" />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Subtotal: {configuracion.moneda}{totalCotizacion.toFixed(2)} <br/>
                  {descuento > 0 && <span className="text-green-600 font-bold">Descuento ({descuento}%): -{configuracion.moneda}{(totalCotizacion * (descuento/100)).toFixed(2)}<br/></span>}
                  <span className="font-black text-gray-900 text-2xl sm:text-3xl">
                    Total: {configuracion.moneda}{(totalCotizacion - (totalCotizacion * (descuento/100))).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {/* BOTONES DE GUARDAR O CANCELAR EDICIÓN */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {cotizacionEnEdicion && (
                  <button onClick={cancelarEdicion} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all text-sm sm:text-base">
                    Cancelar
                  </button>
                )}
                <button 
                  onClick={guardarCotizacionOficial} 
                  disabled={guardandoCotizacion} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  {guardandoCotizacion ? 'Procesando...' : (cotizacionEnEdicion ? '💾 Guardar Cambios' : '💾 Crear Documento')}
                </button>
              </div>

            </div>
          </div>
        )}
        
      </section>
    </div>
  );
}