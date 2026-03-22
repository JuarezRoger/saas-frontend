import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// LA VARIABLE MÁGICA: AHORA EN LOCAL PARA PROBAR EL CORREO
//const API_URL = 'http://127.0.0.1:8000'; 
const API_URL = 'https://atomsaas-api.onrender.com';

function App() {
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
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [itemsCotizacion, setItemsCotizacion] = useState([]);
  const [guardandoCotizacion, setGuardandoCotizacion] = useState(false);
  
  // NUEVO ESTADO: Para saber qué cotización se está enviando y mostrar "Cargando..."
  const [enviandoEmailId, setEnviandoEmailId] = useState(null);

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch(`${API_URL}/api/token/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (respuesta.ok) { const datos = await respuesta.json(); setToken(datos.access); localStorage.setItem('token', datos.access); setErrorLogin(''); } 
      else { setErrorLogin('Usuario o contraseña incorrectos.'); }
    } catch (error) { setErrorLogin('No se pudo conectar al servidor.'); }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault(); setErrorRegistro('');
    try {
      const respuesta = await fetch(`${API_URL}/api/registro/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: regUsername, password: regPassword, email: regEmail, nombre_compania: regCompania }) });
      const datos = await respuesta.json();
      if (respuesta.ok) { alert('¡Agencia creada con éxito! Ahora puedes iniciar sesión.'); setVistaRegistro(false); setUsername(regUsername); } 
      else { setErrorRegistro(datos.error || 'Error al crear la cuenta.'); }
    } catch (error) { setErrorRegistro('Error conectando al servidor.'); }
  };

  const cerrarSesion = () => { setToken(null); localStorage.removeItem('token'); setClientes([]); setServicios([]); setCotizacionesGuardadas([]); };

  useEffect(() => {
    if (token) {
      setCargando(true);
      fetch(`${API_URL}/api/clientes/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(datos => setClientes(datos)).catch(() => cerrarSesion());

      fetch(`${API_URL}/api/servicios/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(datos => setServicios(datos)).catch(() => cerrarSesion());

      fetch(`${API_URL}/api/cotizaciones/`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => { if (!res.ok) throw new Error("Token"); return res.json(); })
        .then(datos => { setCotizacionesGuardadas(datos); setCargando(false); }).catch(() => cerrarSesion());
    }
  }, [token]);

  const crearCliente = async (e) => {
    e.preventDefault(); setCreando(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/clientes/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ nombre_empresa: nuevoNombre, email: nuevoEmail }) });
      if (respuesta.ok) { const clienteCreado = await respuesta.json(); setClientes([...clientes, clienteCreado]); setNuevoNombre(''); setNuevoEmail(''); }
    } catch (error) { console.error(error); } finally { setCreando(false); }
  };

  const agregarItemACotizacion = (e) => {
    e.preventDefault(); if (!servicioSeleccionado || cantidad < 1) return;
    const servicioDb = servicios.find(s => s.id === parseInt(servicioSeleccionado));
    const subtotal = parseFloat(servicioDb.precio_base) * cantidad;
    setItemsCotizacion([...itemsCotizacion, { id_temporal: Date.now(), servicio_id: servicioDb.id, nombre: servicioDb.nombre, precio: parseFloat(servicioDb.precio_base), cantidad: cantidad, subtotal: subtotal }]); 
    setServicioSeleccionado(''); setCantidad(1);
  };

  const totalCotizacion = itemsCotizacion.reduce((suma, item) => suma + item.subtotal, 0);

  const guardarCotizacionOficial = async () => {
    if (!clienteSeleccionado || itemsCotizacion.length === 0) return alert("Faltan datos.");
    setGuardandoCotizacion(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/cotizaciones/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ cliente: parseInt(clienteSeleccionado), detalles: itemsCotizacion.map(item => ({ servicio: item.servicio_id, cantidad: item.cantidad, precio_unitario: item.precio })) }) });
      if (respuesta.ok) { const cotizacionGuardada = await respuesta.json(); alert(`¡Éxito! Cotización guardada.`); setCotizacionesGuardadas([...cotizacionesGuardadas, cotizacionGuardada]); setItemsCotizacion([]); setClienteSeleccionado(''); }
    } catch (error) { console.error(error); } finally { setGuardandoCotizacion(false); }
  };

  const obtenerNombreCliente = (id) => { const cliente = clientes.find(c => c.id === id); return cliente ? cliente.nombre_empresa : 'Desconocido'; };

  // ==========================================
  // FUNCIÓN MAESTRA: DIBUJAR EL PDF (Refactorizada)
  // ==========================================
  const crearDocumentoPDF = (cotizacion) => {
    const doc = new jsPDF();
    const nombreCliente = obtenerNombreCliente(cotizacion.cliente);

    const logo = new Image(); logo.src = '/logo.png'; 
    doc.addImage(logo, 'PNG', 14, 10, 35, 12); 
    
    doc.setFontSize(10); doc.setTextColor(100, 100, 100);
    doc.text("Atom Development System", 195, 15, { align: "right" });
    doc.text("Edificio Corporativo, Piso 4", 195, 20, { align: "right" });
    doc.text("hola@atomsaas.com | +504 9999-0000", 195, 25, { align: "right" });

    doc.setFontSize(20); doc.setTextColor(15, 23, 42); doc.text("COTIZACIÓN DE SERVICIOS", 14, 40); 
    doc.setFontSize(11); doc.setTextColor(75, 85, 99); 
    doc.text(`Documento N°: ${cotizacion.codigo}`, 14, 50); 
    doc.text(`Fecha de Emisión: ${new Date(cotizacion.fecha_creacion).toLocaleDateString()}`, 14, 56); 
    doc.text(`Preparado para:`, 14, 66); 
    doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42); doc.text(nombreCliente, 14, 72); 
    doc.setFont("helvetica", "normal");

    let subtotalGeneral = 0;
    const datosTabla = cotizacion.detalles.map((detalle, index) => {
      const nombreServicio = servicios.find(s => s.id === detalle.servicio)?.nombre || 'Servicio';
      const subtotalFila = parseFloat(detalle.precio_unitario) * detalle.cantidad;
      subtotalGeneral += subtotalFila;
      return [ index + 1, nombreServicio, `$ ${parseFloat(detalle.precio_unitario).toLocaleString('en-US', {minimumFractionDigits: 2})}`, detalle.cantidad, `$ ${subtotalFila.toLocaleString('en-US', {minimumFractionDigits: 2})}` ];
    });

    autoTable(doc, {
      startY: 85, head: [['#', 'Descripción del Servicio', 'Precio Unit.', 'Cant.', 'Subtotal']], body: datosTabla, theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], halign: 'center' }, 
      columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { halign: 'left' }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'right', fontStyle: 'bold' } }
    });

    const finalY = doc.lastAutoTable.finalY || 85;
    const impuesto = subtotalGeneral * 0.15; const totalFinal = subtotalGeneral + impuesto;

    doc.setFontSize(10); doc.setTextColor(75, 85, 99);
    doc.text(`Subtotal:`, 165, finalY + 10, { align: "right" }); doc.text(`$ ${subtotalGeneral.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, finalY + 10, { align: "right" });
    doc.text(`Impuesto (15%):`, 165, finalY + 16, { align: "right" }); doc.text(`$ ${impuesto.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, finalY + 16, { align: "right" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(`TOTAL A INVERTIR:`, 165, finalY + 24, { align: "right" }); doc.text(`$ ${totalFinal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 196, finalY + 24, { align: "right" });

    doc.setFontSize(10); doc.setTextColor(100, 100, 100); doc.setFont("helvetica", "normal");
    doc.text("Términos y Condiciones:\n• Forma de pago: 50% de anticipo para iniciar, 50% contra entrega.\n• Validez de la cotización: 15 días a partir de la fecha de emisión.\n• Los precios están expresados en Dólares Estadounidenses (USD).", 14, finalY + 40);

    return { doc, nombreCliente };
  };

  // ==========================================
  // LAS DOS ACCIONES DEL PDF (Descargar o Enviar)
  // ==========================================
  const generarPDF = (cotizacion) => {
    const { doc, nombreCliente } = crearDocumentoPDF(cotizacion);
    doc.save(`${cotizacion.codigo}_${nombreCliente}.pdf`); // Esto lo descarga
  };

  const enviarPDFPorEmail = async (cotizacion) => {
    setEnviandoEmailId(cotizacion.id); // Activamos el spinner de carga
    try {
      // 1. Dibujamos el PDF en la memoria
      const { doc } = crearDocumentoPDF(cotizacion);
      // 2. Lo convertimos a código (Base64) en lugar de descargarlo
      const pdfBase64 = doc.output('datauristring'); 

      // 3. Se lo mandamos a Django
      const respuesta = await fetch(`${API_URL}/api/cotizaciones/${cotizacion.id}/enviar/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pdf: pdfBase64 })
      });

      const data = await respuesta.json();
      if (respuesta.ok) { alert('✅ ' + data.mensaje); } 
      else { alert('❌ Error: ' + data.error); }

    } catch (error) {
      alert('❌ Error de conexión al intentar enviar el correo.');
    } finally {
      setEnviandoEmailId(null); // Apagamos el spinner
    }
  };

  // ==========================================
  // RENDERIZADO VISUAL
  // ==========================================

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Atom<span className="text-blue-600">SaaS</span></h2>
          <p className="text-center text-gray-500 mb-6 text-sm">{vistaRegistro ? 'Crea tu cuenta de agencia' : 'Ingresa a tu panel de control'}</p>

          {vistaRegistro ? (
            <form onSubmit={manejarRegistro} className="flex flex-col gap-4">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Nombre de Usuario:</label><input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico:</label><input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Contraseña:</label><input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Nombre de tu Agencia:</label><input type="text" value={regCompania} onChange={(e) => setRegCompania(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              {errorRegistro && <p className="text-red-500 text-xs">{errorRegistro}</p>}
              <button type="submit" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg shadow-md">Crear mi Agencia</button>
              <button type="button" onClick={() => setVistaRegistro(false)} className="text-sm text-blue-600 hover:underline mt-2">¿Ya tienes cuenta? Inicia sesión</button>
            </form>
          ) : (
            <form onSubmit={manejarLogin} className="flex flex-col gap-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Usuario:</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
              {errorLogin && <p className="text-red-500 text-sm">{errorLogin}</p>}
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md">Entrar al Panel</button>
              <button type="button" onClick={() => setVistaRegistro(true)} className="text-sm text-blue-600 hover:underline mt-2">¿Aún no tienes cuenta? Regístrate</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <nav className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 mb-8 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Atom<span className="text-blue-600">SaaS</span></h1>
        <button onClick={cerrarSesion} className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 px-4 border border-red-200 rounded-lg">Cerrar Sesión</button>
      </nav>
      
      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-8">
        
        {/* SECCIÓN 1: CLIENTES */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Agregar Nuevo Cliente</h3>
          <form onSubmit={crearCliente} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full"><label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa:</label><input type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div className="flex-1 w-full"><label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico:</label><input type="email" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <button type="submit" disabled={creando} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg">{creando ? 'Guardando...' : '+ Agregar Cliente'}</button>
          </form>
        </section>

        {/* SECCIÓN 2: COTIZADOR */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm border border-blue-100">
          <h2 className="text-xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">✨ Generador de Cotizaciones</h2>
          
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
            <label className="block text-sm font-bold text-gray-700 mb-2">1. Selecciona un Cliente:</label>
            <select value={clienteSeleccionado} onChange={(e) => setClienteSeleccionado(e.target.value)} className="w-full md:w-1/2 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50">
              <option value="">-- Elige un cliente de tu lista --</option>
              {Array.isArray(clientes) && clientes.map(cliente => (<option key={cliente.id} value={cliente.id}>{cliente.nombre_empresa}</option>))}
            </select>
          </div>

          <form onSubmit={agregarItemACotizacion} className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-lg shadow-sm border border-blue-100 mb-6">
            <div className="flex-[2] w-full"><label className="block text-sm font-bold text-gray-700 mb-2">2. Agrega un Servicio:</label>
              <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required>
                <option value="">-- Catálogo de servicios --</option>
                {Array.isArray(servicios) && servicios.map(servicio => (<option key={servicio.id} value={servicio.id}>{servicio.nombre} (${servicio.precio_base})</option>))}
              </select>
            </div>
            <div className="flex-1 w-full"><label className="block text-sm font-bold text-gray-700 mb-2">Cantidad:</label><input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50" required /></div>
            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg">+ Agregar</button>
          </form>

          {itemsCotizacion.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Detalle de la Factura Mágica</h3>
              <table className="w-full text-left border-collapse mb-6">
                <thead><tr className="bg-gray-100 text-gray-600 text-sm uppercase"><th className="p-3">Servicio</th><th className="p-3">Precio</th><th className="p-3">Cant.</th><th className="p-3">Subtotal</th></tr></thead>
                <tbody>
                  {itemsCotizacion.map(item => (
                    <tr key={item.id_temporal} className="border-b"><td className="p-3 font-medium">{item.nombre}</td><td className="p-3">${item.precio.toFixed(2)}</td><td className="p-3">{item.cantidad}</td><td className="p-3 font-bold text-blue-600">${item.subtotal.toFixed(2)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <button onClick={guardarCotizacionOficial} disabled={guardandoCotizacion} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg">💾 Guardar Cotización</button>
                <div className="text-2xl text-gray-700">Total: <span className="font-extrabold text-green-600 text-3xl">${totalCotizacion.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </section>

        {/* SECCIÓN 3: MIS COTIZACIONES (CON BOTÓN DE CORREO) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🗂️ Mis Cotizaciones Guardadas</h2>
          
          {cargando ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : cotizacionesGuardadas.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg"><p className="text-gray-500">Aún no has guardado ninguna cotización.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-100 text-gray-600 text-sm uppercase"><th className="p-4">Código</th><th className="p-4">Cliente</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {[...cotizacionesGuardadas].reverse().map((cot) => (
                    <tr key={cot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-blue-600">{cot.codigo}</td>
                      <td className="p-4 font-medium text-gray-700">{obtenerNombreCliente(cot.cliente)}</td>
                      <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{cot.estado}</span></td>
                      
                      {/* AQUÍ ESTÁN LOS DOS BOTONES */}
                      <td className="p-4 flex gap-2">
                        <button onClick={() => generarPDF(cot)} className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-medium py-1.5 px-3 rounded shadow-sm text-sm">
                          📄 Descargar
                        </button>
                        <button onClick={() => enviarPDFPorEmail(cot)} disabled={enviandoEmailId === cot.id} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium py-1.5 px-3 rounded shadow-sm text-sm disabled:opacity-50 flex items-center gap-1">
                          {enviandoEmailId === cot.id ? '⏳ Enviando...' : '✉️ Enviar Email'}
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;