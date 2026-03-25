import React from 'react';

export default function Cotizador({
  clientes, clienteSeleccionado, setClienteSeleccionado, servicios, servicioSeleccionado,
  setServicioSeleccionado, configuracion, cantidad, setCantidad, agregarItemACotizacion,
  itemsCotizacion, totalCotizacion, guardarCotizacionOficial, guardandoCotizacion,
  cotizacionEnEdicion, cancelarEdicion, eliminarItemCotizacion, descuento, setDescuento
}) {
  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-atomTitulo font-titulos mb-6">
        {cotizacionEnEdicion ? '✏️ Editando Cotización' : 'Nueva Cotización'}
      </h2>
      
      <section className="bg-atomPanel backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-neon-card border border-atomAcento/20">
        
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-bold text-atomTexto mb-2">1. Selecciona el Cliente:</label>
          <select value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)} className="w-full p-3 rounded-xl outline-none">
            <option value="">-- Buscar cliente --</option>
            {Array.isArray(clientes) && clientes.map(c => (<option key={c.id} value={c.id}>{c.nombre_empresa}</option>))}
          </select>
        </div>

        <form onSubmit={agregarItemACotizacion} className="flex flex-col sm:flex-row gap-4 items-end bg-atomFondo/50 p-4 sm:p-6 rounded-xl border border-atomAcento/30 mb-8">
          <div className="flex-[2] w-full">
            <label className="block text-sm font-bold text-atomTexto mb-2">2. Añadir Servicio:</label>
            <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="w-full p-3 rounded-xl outline-none" required>
              <option value="">-- Catálogo --</option>
              {Array.isArray(servicios) && servicios.map(s => (<option key={s.id} value={s.id}>{s.nombre} ({configuracion.moneda}{s.precio_base})</option>))}
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-atomTexto mb-2">Cantidad:</label>
            <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full p-3 rounded-xl outline-none" required />
          </div>
          <button type="submit" className="w-full sm:w-auto bg-atomFondo hover:bg-black text-atomAcento border border-atomAcento font-bold py-3 px-8 rounded-xl transition-colors shadow-neon-blue">
            + Añadir
          </button>
        </form>

        {itemsCotizacion.length > 0 && (
          <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-4">
            <h3 className="text-lg font-bold text-atomTitulo mb-4">Vista Previa</h3>
            <div className="overflow-x-auto mb-6 rounded-xl border border-gray-800">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-atomFondo/80 text-atomTexto text-xs uppercase tracking-wider">
                    <th className="p-3">Servicio</th><th className="p-3">Precio</th><th className="p-3">Cant.</th><th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {itemsCotizacion.map(item => (
                    <tr key={item.id_temporal}>
                      <td className="p-3 font-medium text-atomTitulo text-sm">{item.nombre}</td>
                      <td className="p-3 text-atomTexto text-sm">{configuracion.moneda}{item.precio.toFixed(2)}</td>
                      <td className="p-3 text-atomTexto text-sm">{item.cantidad}</td>
                      <td className="p-3 font-bold text-atomAcento text-sm text-right flex justify-end items-center gap-3">
                        {configuracion.moneda}{item.subtotal.toFixed(2)}
                        <button type="button" onClick={() => eliminarItemCotizacion(item.id_temporal)} className="text-red-500 hover:text-red-400">❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center bg-atomFondo/50 p-4 sm:p-6 rounded-xl border border-atomAcento/30 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-atomTexto">Descuento Global (%):</label>
                  <input type="number" min="0" max="100" value={descuento} onChange={(e) => setDescuento(e.target.value)} className="w-20 p-1 rounded text-center font-bold bg-atomFondo border-gray-700" />
                </div>
                <div className="text-sm text-atomTexto mt-2">
                  Subtotal: {configuracion.moneda}{totalCotizacion.toFixed(2)} <br/>
                  {descuento > 0 && <span className="text-green-400 font-bold">Descuento: -{configuracion.moneda}{(totalCotizacion * (descuento/100)).toFixed(2)}<br/></span>}
                  <span className="font-black text-atomTitulo text-2xl sm:text-3xl">Total: {configuracion.moneda}{(totalCotizacion - (totalCotizacion * (descuento/100))).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {cotizacionEnEdicion && (<button onClick={cancelarEdicion} className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all">Cancelar</button>)}
                <button onClick={guardarCotizacionOficial} disabled={guardandoCotizacion} className="w-full sm:w-auto bg-atomAcento hover:bg-atomAcentoHover text-atomFondo font-bold py-3 px-6 rounded-xl shadow-neon-blue transition-all">
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