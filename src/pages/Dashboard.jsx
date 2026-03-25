import React from 'react';

export default function Dashboard({
  totalClientes, totalCotizaciones, dineroProyectado, configuracion,
  porcentajeAprobado, porcentajePendiente, porcentajeRechazado,
  dineroAprobado, dineroRechazado, cargando, cotizacionesGuardadas,
  cotizacionesActuales, obtenerNombreCliente, cambiarEstadoCotizacion,
  generarPDF, enviarPDFPorEmail, enviandoEmailId,
  totalPaginas, paginaActual, irPaginaAnterior, irPaginaSiguiente,
  eliminarCotizacion,
  cargarCotizacionParaEditar,
  clonarCotizacion,
}) {
// ... resto del código ...
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      
      {/* TARJETAS SUPERIORES */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600 text-2xl">👥</div>
          <div><p className="text-xs text-gray-500 font-bold uppercase">Total Clientes</p><h4 className="text-3xl sm:text-4xl font-black text-gray-800">{totalClientes}</h4></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600 text-2xl">📄</div>
          <div><p className="text-xs text-gray-500 font-bold uppercase">Cotizaciones</p><h4 className="text-3xl sm:text-4xl font-black text-gray-800">{totalCotizaciones}</h4></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 sm:col-span-2 md:col-span-1">
          <div className="bg-green-100 p-4 rounded-xl text-green-600 text-2xl">💰</div>
          <div><p className="text-xs text-gray-500 font-bold uppercase">Valor Proyectado</p><h4 className="text-3xl sm:text-4xl font-black text-green-600 truncate">{configuracion.moneda}{dineroProyectado.toLocaleString('en-US', {minimumFractionDigits: 2})}</h4></div>
        </div>
      </section>

      {/* BARRA DE SALUD */}
      {totalCotizaciones > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Salud del Embudo de Ventas</h3>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex mb-4 shadow-inner">
            <div style={{ width: `${porcentajeAprobado}%` }} className="bg-green-500 transition-all duration-1000"></div>
            <div style={{ width: `${porcentajePendiente}%` }} className="bg-yellow-400 transition-all duration-1000"></div>
            <div style={{ width: `${porcentajeRechazado}%` }} className="bg-red-500 transition-all duration-1000"></div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm font-medium gap-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <span className="text-gray-600">Ganado: <span className="text-gray-900 font-black">{configuracion.moneda}{dineroAprobado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> <span className="text-gray-600">Pendiente: <span className="text-gray-900 font-black">{configuracion.moneda}{(dineroProyectado - dineroAprobado - dineroRechazado).toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> <span className="text-gray-600">Perdido: <span className="text-gray-900 font-black">{configuracion.moneda}{dineroRechazado.toLocaleString('en-US', {minimumFractionDigits: 2})}</span></span></div>
          </div>
        </section>
      )}

      {/* TABLA CON PAGINACIÓN */}
      <section className="bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Historial Reciente</h2>
        {cargando ? (
          <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
        ) : cotizacionesGuardadas.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl"><p className="text-gray-500">Aún no has guardado ninguna cotización.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <th className="p-4 rounded-l-lg">Código</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 rounded-r-lg text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cotizacionesActuales.map((cot) => (
                    <tr key={cot.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 font-bold text-gray-800 text-sm">{cot.codigo}</td>
                      <td className="p-4 font-medium text-gray-600 text-sm">{obtenerNombreCliente(cot.cliente)}</td>
                      <td className="p-4 text-center">
                        <select 
                          value={cot.estado} 
                          onChange={(e) => cambiarEstadoCotizacion(cot.id, e.target.value)} 
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer outline-none appearance-none text-center ${cot.estado === 'Aprobada' ? 'bg-green-100 text-green-800 border-green-300' : cot.estado === 'Rechazada' ? 'bg-red-100 text-red-800 border-red-300' : cot.estado === 'Enviada' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}
                        >
                          <option value="Borrador">Borrador</option>
                          <option value="Enviada">Enviada ✈️</option>
                          <option value="Aprobada">Aprobada ✅</option>
                          <option value="Rechazada">Rechazada ❌</option>
                        </select>
                      </td>
                      <td className="p-4 flex gap-2 justify-end sm:opacity-80 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => generarPDF(cot)} className="bg-white hover:bg-gray-100 border py-1.5 px-3 rounded-lg text-xs font-medium transition-colors">📄 PDF</button>
                        <button onClick={() => enviarPDFPorEmail(cot)} disabled={enviandoEmailId === cot.id} className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-1.5 px-3 rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">
                          {enviandoEmailId === cot.id ? '⏳...' : '✉️ Enviar'}
                        </button>
                        <button onClick={() => cargarCotizacionParaEditar(cot)} className="bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors" title="Editar Cotización">
                          ✏️ Editar
                        </button>
                        <button onClick={() => clonarCotizacion(cot)} className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors" title="Duplicar Cotización">
                          📄 Clonar
                        </button>
                        <button onClick={() => eliminarCotizacion(cot.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors" title="Eliminar Cotización permanentemente">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Página <span className="font-bold text-gray-800">{paginaActual}</span> de <span className="font-bold text-gray-800">{totalPaginas}</span></p>
                <div className="flex gap-2">
                  <button onClick={irPaginaAnterior} disabled={paginaActual === 1} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">Anterior</button>
                  <button onClick={irPaginaSiguiente} disabled={paginaActual === totalPaginas} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}