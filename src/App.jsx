import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast'; 
import { crearDocumentoPDF } from './utils/pdfGenerator'; // NUESTRA NUEVA HERRAMIENTA
import Sidebar from './components/Sidebar';  // NUEVO COMPONENTE SIDEBAR
import Configuracion from './pages/Configuracion'; // PÁGINA DE CONFIGURACIÓN
import Directorio from './pages/Directorio'; // PÁGINA DE DIRECTORIO
import Cotizador from './pages/Cotizador' // PÁGINA DE COTIZADOR
import Dashboard from './pages/Dashboard'; // PÁGINA DE DASHBOARD



const API_URL = 'http://127.0.0.1:8000'; 
// const API_URL = 'https://atomsaas-api.onrender.com';

function App() {
  // ==========================================
  // ESTADOS (VARIABLES)
  // ==========================================
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [errorLogin, setErrorLogin] = useState('');
  
  const [vistaRegistro, setVistaRegistro] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompania, setRegCompania] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');

  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cotizacionesGuardadas, setCotizacionesGuardadas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [creando, setCreando] = useState(false);
  
  const [nuevoServicioNombre, setNuevoServicioNombre] = useState('');
  const [nuevoServicioPrecio, setNuevoServicioPrecio] = useState('');
  const [creandoServicio, setCreandoServicio] = useState(false);

  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [itemsCotizacion, setItemsCotizacion] = useState([]);
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  const [enviandoEmailId, setEnviandoEmailId] = useState(null);
  const [cotizacionEnEdicion, setCotizacionEnEdicion] = useState(null);
  const [descuento, setDescuento] = useState(0);

  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaServicio, setBusquedaServicio] = useState('');

  // 🌟 NUEVOS ESTADOS: UI RESPONSIVA Y PAGINACIÓN
  const [menuExpandido, setMenuExpandido] = useState(true); // Para escritorio (ancho vs encogido)
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false); // Para celular (oculto vs visible)
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  const [configuracion, setConfiguracion] = useState(() => {
    const guardada = localStorage.getItem('saas_config');
    return guardada ? JSON.parse(guardada) : {
      nombre: 'Mi Agencia Digital', direccion: 'Ciudad, País', telefono: 'hola@miagencia.com | +1 234 567 890', impuesto: 15, logoUrl: '/logo.png', moneda: '$', notasPdf: 'Términos y Condiciones:\n• Forma de pago: 50% de anticipo para iniciar, 50% contra entrega.\n• Validez de la cotización: 15 días a partir de la fecha de emisión.'
    };
  });

  // ==========================================
  // FUNCIONES DE RED Y AUTENTICACIÓN
  // ==========================================
  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(`${API_URL}/api/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (respuesta.ok) { 
        const datos = await respuesta.json(); setToken(datos.access); localStorage.setItem('token', datos.access); setErrorLogin(''); toast.success('¡Bienvenido de vuelta!');
      } else { setErrorLogin('Usuario o contraseña incorrectos.'); }
    } catch (error) { setErrorLogin('No se pudo conectar al servidor.'); }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault(); setErrorRegistro('');
    try {
      const respuesta = await fetch(`${API_URL}/api/registro/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: regUsername, password: regPassword, email: regEmail, nombre_compania: regCompania }) });
      const datos = await respuesta.json();
      if (respuesta.ok) { toast.success('¡Agencia creada! Inicia sesión.'); setVistaRegistro(false); setUsername(regUsername); } 
      else { setErrorRegistro(datos.error || 'Error al crear la cuenta.'); }
    } catch (error) { setErrorRegistro('Error conectando al servidor.'); }
  };

  const cerrarSesion = () => { setToken(null); localStorage.removeItem('token'); setClientes([]); setServicios([]); setCotizacionesGuardadas([]); toast('Sesión cerrada', { icon: '👋' }); };

useEffect(() => {
    if (token) {
      setCargando(true);
      // ESCUDO RESTAURADO: Si la respuesta no es "ok" (ej. 401), lanzamos un error que activa cerrarSesion()
      fetch(`${API_URL}/api/clientes/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(setClientes).catch(cerrarSesion);
        
      fetch(`${API_URL}/api/servicios/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(setServicios).catch(cerrarSesion);
        
      fetch(`${API_URL}/api/cotizaciones/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(datos => { setCotizacionesGuardadas(datos); setCargando(false); })
        .catch(cerrarSesion);
    }
  }, [token]);

  // ==========================================
  // FUNCIONES DE NEGOCIO
  // ==========================================
  const manejarSubidaLogo = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setConfiguracion({ ...configuracion, logoUrl: reader.result }); reader.readAsDataURL(file); } };
  const crearCliente = async (e) => { e.preventDefault(); setCreando(true); try { const res = await fetch(`${API_URL}/api/clientes/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ nombre_empresa: nuevoNombre, email: nuevoEmail }) }); if (res.ok) { const data = await res.json(); setClientes([...clientes, data]); setNuevoNombre(''); setNuevoEmail(''); toast.success('Cliente agregado'); } } finally { setCreando(false); } };
  const eliminarCliente = async (id) => { if(!window.confirm('¿Seguro que deseas eliminar este cliente?')) return; try { const res = await fetch(`${API_URL}/api/clientes/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) { setClientes(clientes.filter(c => c.id !== id)); setCotizacionesGuardadas(cotizacionesGuardadas.filter(cot => cot.cliente !== id)); toast.success('Eliminado'); } } catch (e) { toast.error('Error'); } };
  const crearServicio = async (e) => { e.preventDefault(); setCreandoServicio(true); try { const res = await fetch(`${API_URL}/api/servicios/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ nombre: nuevoServicioNombre, precio_base: parseFloat(nuevoServicioPrecio) }) }); if (res.ok) { const data = await res.json(); setServicios([...servicios, data]); setNuevoServicioNombre(''); setNuevoServicioPrecio(''); toast.success('Servicio agregado'); } } finally { setCreandoServicio(false); } };
  const eliminarServicio = async (id) => { if(!window.confirm('¿Eliminar servicio?')) return; try { const res = await fetch(`${API_URL}/api/servicios/${id}/`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) { setServicios(servicios.filter(s => s.id !== id)); toast.success('Eliminado'); } } catch(e) { toast.error('Error'); } };
// Nuevas funciones para Editar
  const actualizarCliente = async (id, nombre_empresa, email) => {
    try {
      const res = await fetch(`${API_URL}/api/clientes/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre_empresa, email })
      });
      if (res.ok) {
        const data = await res.json();
        setClientes(clientes.map(c => c.id === id ? data : c)); // Actualiza la lista en memoria
        toast.success('Cliente actualizado');
        return true;
      } else { toast.error('Error al actualizar'); return false; }
    } catch (e) { toast.error('Error de red'); return false; }
  };

  const actualizarServicio = async (id, nombre, precio_base) => {
    try {
      const res = await fetch(`${API_URL}/api/servicios/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nombre, precio_base: parseFloat(precio_base) })
      });
      if (res.ok) {
        const data = await res.json();
        setServicios(servicios.map(s => s.id === id ? data : s));
        toast.success('Servicio actualizado');
        return true;
      } else { toast.error('Error al actualizar'); return false; }
    } catch (e) { toast.error('Error de red'); return false; }
  };
  const agregarItemACotizacion = (e) => { e.preventDefault(); if (!servicioSeleccionado || cantidad < 1) return; const servicioDb = servicios.find(s => s.id === parseInt(servicioSeleccionado)); const subtotal = parseFloat(servicioDb.precio_base) * cantidad; setItemsCotizacion([...itemsCotizacion, { id_temporal: Date.now(), servicio_id: servicioDb.id, nombre: servicioDb.nombre, precio: parseFloat(servicioDb.precio_base), cantidad: cantidad, subtotal: subtotal }]); setServicioSeleccionado(''); setCantidad(1); };
  const totalCotizacion = itemsCotizacion.reduce((suma, item) => suma + item.subtotal, 0);

  

  const cambiarEstadoCotizacion = async (id, nuevoEstado) => { try { const res = await fetch(`${API_URL}/api/cotizaciones/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ estado: nuevoEstado }) }); if (res.ok) { setCotizacionesGuardadas(cotizacionesGuardadas.map(cot => cot.id === id ? { ...cot, estado: nuevoEstado } : cot)); toast.success(`Estado: ${nuevoEstado}`); } } catch(e) { toast.error('Error'); } };

  const obtenerNombreCliente = (id) => { const cliente = clientes.find(c => c.id === id); return cliente ? cliente.nombre_empresa : 'Desconocido'; };
  const eliminarCotizacion = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta cotización? Esta acción no se puede deshacer y alterará tus proyecciones de ventas.')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/cotizaciones/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Filtramos la lista para quitar la cotización borrada de la memoria
        setCotizacionesGuardadas(cotizacionesGuardadas.filter(cot => cot.id !== id));
        toast.success('Cotización eliminada con éxito');
      } else {
        toast.error('No se pudo eliminar la cotización');
      }
    } catch (e) {
      toast.error('Error de conexión al eliminar');
    }
  };
  // =======================================================
  // BLOQUE DE FUNCIONES DE COTIZACIÓN (COPIAR Y PEGAR AQUÍ)
  // =======================================================
  const cargarCotizacionParaEditar = (cot) => {
    setCotizacionEnEdicion(cot.id);
    setClienteSeleccionado(cot.cliente);
    setDescuento(cot.descuento || 0); 
    
    const itemsFormateados = cot.detalles.map(det => {
      const serv = servicios.find(s => s.id === det.servicio);
      return { id_temporal: Date.now() + Math.random(), servicio_id: det.servicio, nombre: serv ? serv.nombre : 'Servicio Desconocido', precio: parseFloat(det.precio_unitario), cantidad: det.cantidad, subtotal: parseFloat(det.precio_unitario) * det.cantidad };
    });
    setItemsCotizacion(itemsFormateados);
    navegarA('cotizador');
  };

  const clonarCotizacion = (cot) => {
    cargarCotizacionParaEditar(cot); 
    setCotizacionEnEdicion(null);    
    toast.success('Cotización clonada. Modifícala y guárdala como nueva.');
  };

  const eliminarItemCotizacion = (idTemporal) => { 
    setItemsCotizacion(itemsCotizacion.filter(item => item.id_temporal !== idTemporal)); 
  };
  
  const cancelarEdicion = () => {
    setCotizacionEnEdicion(null); setItemsCotizacion([]); setClienteSeleccionado(''); setDescuento(0); 
    navegarA('dashboard');
  };

  const guardarCotizacionOficial = async () => {
    if (!clienteSeleccionado || itemsCotizacion.length === 0) return toast.error("Faltan datos."); 
    setGuardandoCotizacion(true); 
    const toastId = toast.loading(cotizacionEnEdicion ? 'Actualizando...' : 'Guardando...');

    const payload = { 
      cliente: parseInt(clienteSeleccionado), 
      descuento: parseFloat(descuento) || 0, 
      detalles: itemsCotizacion.map(item => ({ servicio: item.servicio_id, cantidad: item.cantidad, precio_unitario: item.precio })) 
    };

    try { 
      const url = cotizacionEnEdicion ? `${API_URL}/api/cotizaciones/${cotizacionEnEdicion}/` : `${API_URL}/api/cotizaciones/`;
      const method = cotizacionEnEdicion ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) }); 
      
      if (res.ok) { 
        const data = await res.json(); 
        if (cotizacionEnEdicion) { setCotizacionesGuardadas(cotizacionesGuardadas.map(c => c.id === cotizacionEnEdicion ? data : c)); } 
        else { setCotizacionesGuardadas([...cotizacionesGuardadas, data]); }
        setItemsCotizacion([]); setClienteSeleccionado(''); setCotizacionEnEdicion(null); setDescuento(0); setVistaActiva('dashboard'); 
        toast.success(cotizacionEnEdicion ? 'Actualizada' : 'Guardada', { id: toastId }); 
      } else { toast.error('Error al guardar', { id: toastId }); }
    } catch (e) { toast.error('Error de red', { id: toastId }); } finally { setGuardandoCotizacion(false); }
  };
  // =======================================================

// ==========================================
  // FUNCIONES DEL PDF (Refactorizadas)
  // ==========================================
  const generarPDF = (cotizacion) => { 
    // Le pasamos los datos a la herramienta externa
    const { doc, nombreCliente } = crearDocumentoPDF(cotizacion, configuracion, clientes, servicios); 
    doc.save(`${cotizacion.codigo}_${nombreCliente}.pdf`); 
    toast.success('Descargado'); 
  };

  const enviarPDFPorEmail = async (cotizacion) => { 
    setEnviandoEmailId(cotizacion.id); 
    const toastId = toast.loading('Enviando...'); 
    try { 
      // Le pasamos los datos a la herramienta externa
      const { doc } = crearDocumentoPDF(cotizacion, configuracion, clientes, servicios); 
      const pdfBase64 = doc.output('datauristring'); 
      const res = await fetch(`${API_URL}/api/cotizaciones/${cotizacion.id}/enviar/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ pdf: pdfBase64 }) }); 
      const data = await res.json(); 
      if (res.ok) { toast.success('Correo enviado', { id: toastId }); } else { toast.error('Error: ' + data.error, { id: toastId }); } 
    } catch (e) { toast.error('Error de red', { id: toastId }); } finally { setEnviandoEmailId(null); } 
  };


  // ==========================================
  // CÁLCULOS Y PAGINACIÓN 🌟
  // ==========================================
  const totalClientes = clientes.length;
  const totalCotizaciones = cotizacionesGuardadas.length;
  const dineroProyectado = cotizacionesGuardadas.reduce((total, cot) => { const subtotal = cot.detalles.reduce((sum, det) => sum + (parseFloat(det.precio_unitario) * det.cantidad), 0); return total + (subtotal * (1 + configuracion.impuesto / 100)); }, 0);
  const dineroAprobado = cotizacionesGuardadas.filter(c => c.estado === 'Aprobada').reduce((t, c) => t + c.detalles.reduce((s, d) => s + (parseFloat(d.precio_unitario) * d.cantidad), 0) * (1 + configuracion.impuesto / 100), 0);
  const dineroRechazado = cotizacionesGuardadas.filter(c => c.estado === 'Rechazada').reduce((t, c) => t + c.detalles.reduce((s, d) => s + (parseFloat(d.precio_unitario) * d.cantidad), 0) * (1 + configuracion.impuesto / 100), 0);
  const porcentajeAprobado = dineroProyectado > 0 ? (dineroAprobado / dineroProyectado) * 100 : 0;
  const porcentajeRechazado = dineroProyectado > 0 ? (dineroRechazado / dineroProyectado) * 100 : 0;
  const porcentajePendiente = dineroProyectado > 0 ? 100 - porcentajeAprobado - porcentajeRechazado : 0;

  const clientesFiltrados = clientes.filter(c => c.nombre_empresa.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.email.toLowerCase().includes(busquedaCliente.toLowerCase()));
  const serviciosFiltrados = servicios.filter(s => s.nombre.toLowerCase().includes(busquedaServicio.toLowerCase()));

  // Lógica de Paginación para Cotizaciones
  const cotizacionesReversadas = [...cotizacionesGuardadas].reverse();
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const cotizacionesActuales = cotizacionesReversadas.slice(indicePrimerItem, indiceUltimoItem);
  const totalPaginas = Math.ceil(cotizacionesGuardadas.length / itemsPorPagina) || 1;

  const irPaginaSiguiente = () => setPaginaActual(p => Math.min(p + 1, totalPaginas));
  const irPaginaAnterior = () => setPaginaActual(p => Math.max(p - 1, 1));

  // Manejo de navegación para móviles (cerrar el menú al hacer clic)
  const navegarA = (vista) => { setVistaActiva(vista); setMenuMovilAbierto(false); };

  // ==========================================
  // PANTALLA LOGIN
  // ==========================================
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Toaster position="top-right" />
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Atom<span className="text-blue-600">SaaS</span></h2>
          {vistaRegistro ? (
            <form onSubmit={manejarRegistro} className="flex flex-col gap-4">
              <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="Usuario" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="Correo" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Contraseña" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <input type="text" value={regCompania} onChange={(e) => setRegCompania(e.target.value)} placeholder="Tu Agencia" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-2.5 rounded-lg shadow-md">Crear Agencia</button>
              <button type="button" onClick={() => setVistaRegistro(false)} className="text-sm text-blue-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</button>
            </form>
          ) : (
            <form onSubmit={manejarLogin} className="flex flex-col gap-4">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow-md">Entrar</button>
              <button type="button" onClick={() => setVistaRegistro(true)} className="text-sm text-blue-600 hover:underline">¿No tienes cuenta? Regístrate</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PANEL PRINCIPAL (RESPONSIVO Y RETRÁCTIL)
  // ==========================================
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Toaster position="top-right" /> 
      {/* NUESTRO NUEVO COMPONENTE SIDEBAR LIMPIO */}
      <Sidebar 
        vistaActiva={vistaActiva} 
        navegarA={navegarA} 
        menuExpandido={menuExpandido} 
        menuMovilAbierto={menuMovilAbierto} 
        setMenuMovilAbierto={setMenuMovilAbierto} 
        configuracion={configuracion} 
        cerrarSesion={cerrarSesion} 
      />
      
      
      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
        
        {/* HEADER SUPERIOR (Boton Hamburger y Controles) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Botón Hamburger (Móvil) */}
            <button onClick={() => setMenuMovilAbierto(true)} className="md:hidden text-gray-600 hover:text-gray-900 text-2xl p-1">
              ☰
            </button>
            {/* Botón Retráctil (Escritorio) */}
            <button onClick={() => setMenuExpandido(!menuExpandido)} className="hidden md:block text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Expandir/Contraer Menú">
              {menuExpandido ? '◀' : '▶'}
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 capitalize hidden sm:block">{vistaActiva}</h2>
          </div>
        </header>

        {/* CONTENIDO DESLIZABLE */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* VISTA 1: DASHBOARD */}
            {vistaActiva === 'dashboard' && (
              <Dashboard 
                totalClientes={totalClientes}
                totalCotizaciones={totalCotizaciones}
                dineroProyectado={dineroProyectado}
                configuracion={configuracion}
                porcentajeAprobado={porcentajeAprobado}
                porcentajePendiente={porcentajePendiente}
                porcentajeRechazado={porcentajeRechazado}
                dineroAprobado={dineroAprobado}
                dineroRechazado={dineroRechazado}
                cargando={cargando}
                cotizacionesGuardadas={cotizacionesGuardadas}
                cotizacionesActuales={cotizacionesActuales}
                obtenerNombreCliente={obtenerNombreCliente}
                cambiarEstadoCotizacion={cambiarEstadoCotizacion}
                generarPDF={generarPDF}
                enviarPDFPorEmail={enviarPDFPorEmail}
                enviandoEmailId={enviandoEmailId}
                totalPaginas={totalPaginas}
                paginaActual={paginaActual}
                irPaginaAnterior={irPaginaAnterior}
                irPaginaSiguiente={irPaginaSiguiente}
                eliminarCotizacion={eliminarCotizacion}
                cargarCotizacionParaEditar={cargarCotizacionParaEditar}
                clonarCotizacion={clonarCotizacion}
                // ¡Aquí quitamos el error!
              />
            )}

            {/* VISTA 2: COTIZADOR */}
            {vistaActiva === 'cotizador' && (
              <Cotizador 
                clientes={clientes}
                clienteSeleccionado={clienteSeleccionado}
                setClienteSeleccionado={setClienteSeleccionado}
                servicios={servicios}
                servicioSeleccionado={servicioSeleccionado}
                setServicioSeleccionado={setServicioSeleccionado}
                configuracion={configuracion}
                cantidad={cantidad}
                setCantidad={setCantidad}
                agregarItemACotizacion={agregarItemACotizacion}
                itemsCotizacion={itemsCotizacion}
                totalCotizacion={totalCotizacion}
                guardarCotizacionOficial={guardarCotizacionOficial}
                guardandoCotizacion={guardandoCotizacion}
                cotizacionEnEdicion={cotizacionEnEdicion}
                cancelarEdicion={cancelarEdicion}
                eliminarItemCotizacion={eliminarItemCotizacion}
                descuento={descuento}
                setDescuento={setDescuento}
              />
            )}

            {/* VISTA 3: DIRECTORIO */}
            {vistaActiva === 'directorio' && (
              <Directorio 
                clientes={clientes} 
                servicios={servicios} 
                nuevoNombre={nuevoNombre} setNuevoNombre={setNuevoNombre} 
                nuevoEmail={nuevoEmail} setNuevoEmail={setNuevoEmail} 
                creando={creando} crearCliente={crearCliente} eliminarCliente={eliminarCliente} 
                nuevoServicioNombre={nuevoServicioNombre} setNuevoServicioNombre={setNuevoServicioNombre} 
                nuevoServicioPrecio={nuevoServicioPrecio} setNuevoServicioPrecio={setNuevoServicioPrecio} 
                creandoServicio={creandoServicio} crearServicio={crearServicio} eliminarServicio={eliminarServicio} 
                configuracion={configuracion} 
                busquedaCliente={busquedaCliente} setBusquedaCliente={setBusquedaCliente} 
                busquedaServicio={busquedaServicio} setBusquedaServicio={setBusquedaServicio} 
                clientesFiltrados={clientesFiltrados} serviciosFiltrados={serviciosFiltrados}
                actualizarCliente={actualizarCliente}
                actualizarServicio={actualizarServicio}
              />
            )}

            {/* VISTA 4: CONFIGURACIÓN */}
            {vistaActiva === 'configuracion' && (
              <Configuracion 
                configuracion={configuracion} 
                setConfiguracion={setConfiguracion} 
                manejarSubidaLogo={manejarSubidaLogo}
                token={token}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default App;