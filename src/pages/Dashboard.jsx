import React from 'react';

export default function Dashboard({
  totalClientes, totalCotizaciones, dineroProyectado, configuracion, porcentajeAprobado, porcentajePendiente, porcentajeRechazado,
  dineroAprobado, dineroRechazado, cargando, cotizacionesGuardadas, cotizacionesActuales, obtenerNombreCliente, cambiarEstadoCotizacion,
  generarPDF, enviarPDFPorEmail, enviandoEmailId, totalPaginas, paginaActual, irPaginaAnterior, irPaginaSiguiente,
  eliminarCotizacion, cargarCotizacionParaEditar, clonarCotizacion
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20 flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400 text-2xl">👥</div>
          <div><p className="text-xs text-atomTexto font-bold uppercase">Clientes</p><h4 className="text-3xl sm:text-4xl font-black text-atomTitulo font-titulos">{totalClientes}</h4></div>
        </div>
        <div className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20 flex items-center gap-4">
          <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400 text-2xl">📄</div>
          <div><p className="text-xs text-atomTexto font-bold uppercase">Cotizaciones</p><h4 className="text-3xl sm:text-4xl font-black text-atomTitulo font-titulos">{totalCotizaciones}</h4></div>
        </div>
        <div className="bg-atomPanel backdrop-blur-md p-6 rounded-2xl shadow-neon-card border border-atomAcento/20 flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="bg-green-500/20 p-4 rounded-xl text-green-400 text-2xl">💰</div>
          <div><p className="text-xs text-atomTexto font-bold uppercase">Proyectado</p><h4 className="text-3xl sm:text-4xl font-black text-atomAcento font-titulos truncate">{configuracion.moneda}{dineroProyectado.toLocaleString('en-US', {minimumFractionDigits: 2})}</h4></div>
        </div>
      </section>

      {totalCotizaciones > 0 && (
        <section className="bg-atomPanel backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-neon-card border border-atomAcento/20">
          <h3 className="text-lg font-bold text-atomTitulo mb-4 font-titulos">Salud del Embudo</h3>
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden flex mb-4 shadow-inner">
            <div style={{ width: `${porcentajeAprobado}%` }} className="bg-green-500 transition-all duration-1000"></div>
            <div style={{ width: `${porcentajePendiente}%` }} className="bg-yellow-500 transition-all duration-1000"></div>
            <div style={{ width: `${porcentajeRechazado}%` }} className="bg-red-500 transition-all duration-1000"></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm font-medium gap-2 text-atomTexto">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <span>Ganado: <span className="text-white font-black">{configuracion.moneda}{dineroAprobado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> <span>Pendiente: <span className="text-white font-black">{configuracion.moneda}{(dineroProyectado - dineroAprobado - dineroRechazado).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <span>Perdido: <span className="text-white font-black">{configuracion.moneda}{dineroRechazado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
          </div>
        </section>
      )}

      <section className="bg-atomPanel backdrop-blur-md p-4 sm:p-8 rounded-2xl shadow-neon-card border border-atomAcento/20 overflow-hidden">
        <h2 className="text-lg font-bold text-atomTitulo mb-4 font-titulos">Historial Reciente</h2>
        {cargando ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-atomAcento"></div></div>
        ) : cotizacionesGuardadas.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-xl"><p className="text-atomTexto">No hay cotizaciones.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-atomFondo text-atomTexto text-xs uppercase font-bold tracking-wider">
                    <th className="p-4">Código</th><th className="p-4">Cliente</th><th className="p-4 text-center">Estado</th><th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cotizacionesActuales.map((cot) => (
                    <tr key={cot.id} className="hover:bg-atomFondo/50 transition-colors group">
                      <td className="p-4 font-bold text-atomTitulo text-sm">{cot.codigo}</td>
                      <td className="p-4 font-medium text-atomTexto text-sm">{obtenerNombreCliente(cot.cliente)}</td>
                      <td className="p-4 text-center">
                        <select 
                          value={cot.estado} onChange={(e) => cambiarEstadoCotizacion(cot.id, e.target.value)} 
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none appearance-none text-center bg-atomFondo ${cot.estado === 'Aprobada' ? 'text-green-400 border-green-500/30' : cot.estado === 'Rechazada' ? 'text-red-400 border-red-500/30' : cot.estado === 'Enviada' ? 'text-yellow-400 border-yellow-500/30' : 'text-blue-400 border-blue-500/30'}`}
                        >
                          <option value="Borrador">Borrador</option><option value="Enviada">Enviada ✈️</option><option value="Aprobada">Aprobada ✅</option><option value="Rechazada">Rechazada ❌</option>
                        </select>
                      </td>
                      <td className="p-4 flex gap-2 justify-end sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => generarPDF(cot)} className="bg-gray-800 hover:bg-gray-700 text-white py-1.5 px-3 rounded-lg text-xs font-medium">📄 PDF</button>
                        <button onClick={() => enviarPDFPorEmail(cot)} disabled={enviandoEmailId === cot.id} className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30 py-1.5 px-3 rounded-lg text-xs font-medium disabled:opacity-50">{enviandoEmailId === cot.id ? '⏳' : '✉️'}</button>
                        <button onClick={() => cargarCotizacionParaEditar(cot)} className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/30 py-1.5 px-3 rounded-lg text-xs font-medium">✏️</button>
                        <button onClick={() => clonarCotizacion(cot)} className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 border border-purple-500/30 py-1.5 px-3 rounded-lg text-xs font-medium">📄</button>
                        <button onClick={() => eliminarCotizacion(cot.id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 py-1.5 px-3 rounded-lg text-xs font-medium">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
                <p className="text-sm text-atomTexto">Página <span className="font-bold text-white">{paginaActual}</span> de <span className="font-bold text-white">{totalPaginas}</span></p>
                <div className="flex gap-2">
                  <button onClick={irPaginaAnterior} disabled={paginaActual === 1} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-white hover:bg-gray-800 disabled:opacity-50">Anterior</button>
                  <button onClick={irPaginaSiguiente} disabled={paginaActual === totalPaginas} className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-white hover:bg-gray-800 disabled:opacity-50">Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}