import React from 'react';

export default function Sidebar({ vistaActiva, navegarA, menuExpandido, menuMovilAbierto, setMenuMovilAbierto, configuracion, cerrarSesion }) {
  
  const itemsMenu = [
    { id: 'dashboard', icono: '📊', texto: 'Dashboard' },
    { id: 'cotizador', icono: '📄', texto: 'Crear Cotización' },
    { id: 'directorio', icono: '📁', texto: 'Directorio' },
    { id: 'configuracion', icono: '⚙️', texto: 'Configuración' }
  ];

  return (
    <>
      {/* FONDO OSCURO PARA MÓVILES (Fondo difuminado cuando el menú se abre) */}
      {menuMovilAbierto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMenuMovilAbierto(false)}
        ></div>
      )}

      {/* CONTENEDOR DEL SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        bg-atomPanel backdrop-blur-xl border-r border-gray-800
        transform transition-all duration-300 ease-in-out flex flex-col
        ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${menuExpandido ? 'w-64' : 'w-20'}
      `}>
        
        {/* LOGO Y NOMBRE DE LA AGENCIA */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800 flex-shrink-0 px-4">
          <div className="bg-atomAcento text-atomFondo font-black w-18 h-18 rounded flex items-center justify-center text-xl shadow-neon-blue">
            <img src="/image.png" alt="SaaSAtom" className="h-10 object-contain drop-shadow-[0_0_15px_rgba(0,242,254,0.4)]" />
          </div>
          {menuExpandido && (
            <span className="ml-3 font-titulos font-bold text-atomTitulo text-lg whitespace-nowrap overflow-hidden">
              Atom<span className="text-atomAcento">System</span>
            </span>
          )}
        </div>

        {/* ENLACES DEL MENÚ */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          {itemsMenu.map((item) => {
            const activo = vistaActiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navegarA(item.id)}
                className={`
                  flex items-center w-full p-3 rounded-xl transition-all duration-200
                  ${activo 
                    ? 'bg-atomAcento/10 text-atomAcento border border-atomAcento/30 shadow-[inset_4px_0_0_0_#00f2fe]' 
                    : 'text-atomTexto hover:bg-atomFondo/50 hover:text-atomTitulo border border-transparent'}
                `}
                title={!menuExpandido ? item.texto : ''}
              >
                <span className="text-xl flex-shrink-0 w-6 text-center">{item.icono}</span>
                {menuExpandido && <span className="ml-4 font-medium text-sm whitespace-nowrap">{item.texto}</span>}
              </button>
            );
          })}
        </nav>

        {/* ÁREA DE USUARIO Y CERRAR SESIÓN */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-atomFondo border border-gray-700 overflow-hidden flex-shrink-0">
              <img src={configuracion.logoUrl || '/logo.png'} alt="Logo" className="w-full h-full object-cover" />
            </div>
            {menuExpandido && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs text-atomTexto truncate">Agencia</p>
                <p className="text-sm font-bold text-atomTitulo truncate">{configuracion.nombre}</p>
              </div>
            )}
          </div>
          
          <button 
            onClick={cerrarSesion}
            className={`
              w-full flex items-center justify-center gap-2 p-2 rounded-xl
              bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 hover:border-red-500
              transition-all duration-200 text-sm font-bold
            `}
          >
            <span className="text-lg">🚪</span>
            {menuExpandido && <span>Salir</span>}
          </button>
        </div>
      </aside>
    </>
  );
}