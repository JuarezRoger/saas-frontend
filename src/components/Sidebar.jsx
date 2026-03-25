import React from 'react';

export default function Sidebar({
  vistaActiva,
  navegarA,
  menuExpandido,
  menuMovilAbierto,
  setMenuMovilAbierto,
  configuracion,
  cerrarSesion
}) {
  return (
    <>
      {/* OVERLAY PARA MÓVILES (Oscurece el fondo cuando el menú está abierto) */}
      {menuMovilAbierto && (
        <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setMenuMovilAbierto(false)}></div>
      )}

      {/* SIDEBAR (RETRÁCTIL EN DESKTOP, DESLIZABLE EN MÓVIL) */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 bg-gray-900 text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out 
        ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${menuExpandido ? 'w-64' : 'w-20'}`}
      >
        {/* LOGO AREA */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl flex-shrink-0">A</div>
            {menuExpandido && <h1 className="text-xl font-extrabold tracking-tight whitespace-nowrap">Atom<span className="text-blue-400">SaaS</span></h1>}
          </div>
        </div>
        
        {/* LINKS */}
        <nav className="flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden px-3">
          <button onClick={() => navegarA('dashboard')} className={`w-full flex items-center ${menuExpandido ? 'justify-start px-4' : 'justify-center'} py-3 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title="Dashboard">
            <span className="text-xl">📊</span> {menuExpandido && <span className="ml-3 whitespace-nowrap">Dashboard</span>}
          </button>
          <button onClick={() => navegarA('cotizador')} className={`w-full flex items-center ${menuExpandido ? 'justify-start px-4' : 'justify-center'} py-3 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'cotizador' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title="Crear Cotización">
            <span className="text-xl">📝</span> {menuExpandido && <span className="ml-3 whitespace-nowrap">Crear Cotización</span>}
          </button>
          <button onClick={() => navegarA('directorio')} className={`w-full flex items-center ${menuExpandido ? 'justify-start px-4' : 'justify-center'} py-3 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'directorio' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title="Directorio">
            <span className="text-xl">📁</span> {menuExpandido && <span className="ml-3 whitespace-nowrap">Directorio</span>}
          </button>
          <div className="pt-6">
            <button onClick={() => navegarA('configuracion')} className={`w-full flex items-center ${menuExpandido ? 'justify-start px-4' : 'justify-center'} py-3 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'configuracion' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title="Configuración">
              <span className="text-xl">⚙️</span> {menuExpandido && <span className="ml-3 whitespace-nowrap">Configuración</span>}
            </button>
          </div>
        </nav>

        {/* USUARIO AREA */}
        <div className="p-4 border-t border-gray-800 flex flex-col items-center gap-4">
          <div className={`flex items-center gap-3 overflow-hidden ${!menuExpandido && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full border-2 border-gray-600 flex-shrink-0 bg-white overflow-hidden">
               <img src={configuracion.logoUrl || '/logo.png'} alt="logo" className="w-full h-full object-contain"/>
            </div>
            {menuExpandido && (
              <div className="whitespace-nowrap">
                <p className="text-xs text-gray-400">Agencia</p>
                <p className="text-sm font-bold truncate max-w-[120px]">{configuracion.nombre}</p>
              </div>
            )}
          </div>
          <button onClick={cerrarSesion} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm transition-colors" title="Cerrar Sesión">
            <span className="text-lg">🚪</span> {menuExpandido && <span className="font-bold whitespace-nowrap">Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}