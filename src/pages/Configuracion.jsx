import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Configuracion({ configuracion, setConfiguracion, manejarSubidaLogo, token }) {
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmacion, setPassConfirmacion] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  const API_URL = 'http://127.0.0.1:8000';

  const guardarConfiguracionGeneral = (e) => {
    e.preventDefault();
    localStorage.setItem('saas_config', JSON.stringify(configuracion));
    toast.success('¡Configuración de la Agencia guardada!');
  };

  const actualizarPassword = async (e) => {
    e.preventDefault();
    if (passNueva !== passConfirmacion) return toast.error('Las contraseñas nuevas no coinciden');
    if (passNueva.length < 6) return toast.error('La nueva contraseña debe tener al menos 6 caracteres');
    setCambiandoPass(true);
    const toastId = toast.loading('Actualizando candados de seguridad...');
    try {
      const res = await fetch(`${API_URL}/api/cambiar-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password_actual: passActual, password_nueva: passNueva })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('¡Contraseña actualizada con éxito!', { id: toastId });
        setPassActual(''); setPassNueva(''); setPassConfirmacion('');
      } else { toast.error(data.error || 'Error al actualizar', { id: toastId }); }
    } catch (error) { toast.error('Error de conexión', { id: toastId }); } finally { setCambiandoPass(false); }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in flex flex-col gap-8">
      
      {/* SECCIÓN 1: CONFIGURACIÓN */}
      <section className="bg-atomPanel backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-neon-card border border-atomAcento/20">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl font-bold text-atomTitulo font-titulos">Datos de la Agencia</h2>
        </div>
        
        <form onSubmit={guardarConfiguracionGeneral} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Nombre de la Agencia:</label>
              <input type="text" value={configuracion.nombre} onChange={(e) => setConfiguracion({...configuracion, nombre: e.target.value})} className="w-full p-3 rounded-xl outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Logo de la Agencia:</label>
              <input type="file" accept="image/*" onChange={manejarSubidaLogo} className="w-full p-2 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-atomAcento file:text-atomFondo hover:file:bg-atomAcentoHover file:cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Dirección Fiscal:</label>
              <input type="text" value={configuracion.direccion} onChange={(e) => setConfiguracion({...configuracion, direccion: e.target.value})} className="w-full p-3 rounded-xl outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Teléfono / Contacto:</label>
              <input type="text" value={configuracion.telefono} onChange={(e) => setConfiguracion({...configuracion, telefono: e.target.value})} className="w-full p-3 rounded-xl outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Moneda (Símbolo):</label>
              <input type="text" value={configuracion.moneda} onChange={(e) => setConfiguracion({...configuracion, moneda: e.target.value})} className="w-full p-3 rounded-xl outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-atomTexto mb-2">Impuesto por defecto (%):</label>
              <input type="number" min="0" step="0.1" value={configuracion.impuesto} onChange={(e) => setConfiguracion({...configuracion, impuesto: parseFloat(e.target.value)})} className="w-full p-3 rounded-xl outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-atomTexto mb-2">Términos y Notas Legales:</label>
            <textarea value={configuracion.notasPdf} onChange={(e) => setConfiguracion({...configuracion, notasPdf: e.target.value})} rows="4" className="w-full p-3 rounded-xl outline-none resize-none"></textarea>
          </div>

          <button type="submit" className="w-full sm:w-auto self-end bg-atomAcento hover:bg-atomAcentoHover text-atomFondo font-bold py-3 px-8 rounded-xl shadow-neon-blue transition-all">
            💾 Guardar Datos
          </button>
        </form>
      </section>

      {/* SECCIÓN 2: SEGURIDAD */}
      <section className="bg-atomPanel backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-neon-card border border-red-500/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔒</span>
          <div>
            <h2 className="text-xl font-bold text-atomTitulo font-titulos">Seguridad de la Cuenta</h2>
            <p className="text-sm text-atomTexto">Actualiza tu contraseña de acceso.</p>
          </div>
        </div>

        <form onSubmit={actualizarPassword} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-atomTexto mb-2">Contraseña Actual:</label>
            <input type="password" value={passActual} onChange={(e) => setPassActual(e.target.value)} className="w-full p-3 rounded-xl outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-atomTexto mb-2">Nueva Contraseña:</label>
            <input type="password" value={passNueva} onChange={(e) => setPassNueva(e.target.value)} className="w-full p-3 rounded-xl outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-atomTexto mb-2">Confirmar Nueva Contraseña:</label>
            <input type="password" value={passConfirmacion} onChange={(e) => setPassConfirmacion(e.target.value)} className="w-full p-3 rounded-xl outline-none focus:ring-red-500 focus:border-red-500" required />
          </div>

          <button type="submit" disabled={cambiandoPass} className="w-full mt-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500 font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50">
            {cambiandoPass ? 'Actualizando...' : '🔐 Cambiar Contraseña'}
          </button>
        </form>
      </section>

    </div>
  );
}