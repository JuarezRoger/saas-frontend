import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Configuracion({ configuracion, setConfiguracion, manejarSubidaLogo, token }) {
  // ESTADOS LOCALES PARA LA SEGURIDAD
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [passConfirmacion, setPassConfirmacion] = useState('');
  const [cambiandoPass, setCambiandoPass] = useState(false);

  // LA URL DE TU API (Si luego la subes a internet, cambias esto por tu URL real)
  const API_URL = 'http://127.0.0.1:8000';

  const guardarConfiguracionGeneral = (e) => {
    e.preventDefault();
    localStorage.setItem('saas_config', JSON.stringify(configuracion));
    toast.success('¡Configuración de la Agencia guardada!');
  };

  const actualizarPassword = async (e) => {
    e.preventDefault();
    
    // Validaciones rápidas en el Frontend
    if (passNueva !== passConfirmacion) return toast.error('Las contraseñas nuevas no coinciden');
    if (passNueva.length < 6) return toast.error('La nueva contraseña debe tener al menos 6 caracteres');

    setCambiandoPass(true);
    const toastId = toast.loading('Actualizando candados de seguridad...');

    try {
      const res = await fetch(`${API_URL}/api/cambiar-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Usamos el gafete para demostrar quiénes somos
        },
        body: JSON.stringify({
          password_actual: passActual,
          password_nueva: passNueva
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('¡Contraseña actualizada con éxito!', { id: toastId });
        setPassActual('');
        setPassNueva('');
        setPassConfirmacion('');
      } else {
        toast.error(data.error || 'Error al actualizar', { id: toastId });
      }
    } catch (error) {
      toast.error('Error de conexión al servidor', { id: toastId });
    } finally {
      setCambiandoPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in flex flex-col gap-8">
      
      {/* SECCIÓN 1: CONFIGURACIÓN DE LA AGENCIA */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-xl font-bold text-gray-800">Datos de la Agencia</h2>
        </div>
        
        <form onSubmit={guardarConfiguracionGeneral} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la Agencia:</label>
              <input type="text" value={configuracion.nombre} onChange={(e) => setConfiguracion({...configuracion, nombre: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Logo de la Agencia (PNG/JPG):</label>
              <input type="file" accept="image/*" onChange={manejarSubidaLogo} className="w-full p-2 border border-gray-300 rounded-xl bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Dirección Fiscal:</label>
              <input type="text" value={configuracion.direccion} onChange={(e) => setConfiguracion({...configuracion, direccion: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono / Contacto:</label>
              <input type="text" value={configuracion.telefono} onChange={(e) => setConfiguracion({...configuracion, telefono: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Moneda (Símbolo):</label>
              <input type="text" value={configuracion.moneda} onChange={(e) => setConfiguracion({...configuracion, moneda: e.target.value})} placeholder="Ej: $, L, €" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Impuesto por defecto (%):</label>
              <input type="number" min="0" step="0.1" value={configuracion.impuesto} onChange={(e) => setConfiguracion({...configuracion, impuesto: parseFloat(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Términos y Notas Legales (Aparecen al final del PDF):</label>
            <textarea value={configuracion.notasPdf} onChange={(e) => setConfiguracion({...configuracion, notasPdf: e.target.value})} rows="4" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 outline-none resize-none"></textarea>
          </div>

          <button type="submit" className="w-full sm:w-auto self-end bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all">
            💾 Guardar Datos de Agencia
          </button>
        </form>
      </section>

      {/* SECCIÓN 2: SEGURIDAD DE LA CUENTA */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-red-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🔒</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Seguridad de la Cuenta</h2>
            <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso al sistema.</p>
          </div>
        </div>

        <form onSubmit={actualizarPassword} className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña Actual:</label>
            <input 
              type="password" 
              value={passActual} 
              onChange={(e) => setPassActual(e.target.value)} 
              placeholder="Tu contraseña actual" 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña:</label>
            <input 
              type="password" 
              value={passNueva} 
              onChange={(e) => setPassNueva(e.target.value)} 
              placeholder="Mínimo 6 caracteres" 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 outline-none" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Nueva Contraseña:</label>
            <input 
              type="password" 
              value={passConfirmacion} 
              onChange={(e) => setPassConfirmacion(e.target.value)} 
              placeholder="Repite la nueva contraseña" 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-gray-50 outline-none" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={cambiandoPass}
            className="w-full mt-2 bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {cambiandoPass ? 'Actualizando...' : '🔐 Cambiar Contraseña'}
          </button>
        </form>
      </section>

    </div>
  );
}