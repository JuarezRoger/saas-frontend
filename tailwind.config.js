/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🌟 RE-DEFINIMOS LA PALETA DE COLORES PREMIUM
      colors: {
        // Fondo principal (Muy oscuro)
        atomFondo: '#0a0f1e', 
        // Tarjetas/Paneles con efecto vidrio (Un gris-azul oscuro translúcido)
        atomPanel: 'rgba(23, 31, 56, 0.7)', 
        // Acento Eléctrico (Sustituye al azul estándar)
        atomAcento: '#00f2fe', 
        atomAcentoHover: '#4facfe',
        // Títulos principales
        atomTitulo: '#ffffff',
        // Textos secundarios
        atomTexto: '#a1a7c1',
      },
      // 🌟 AGREGAMOS EFECTO DE RESPLANDOR NEÓN (Sombreado especial)
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 242, 254, 0.3), 0 0 1px rgba(0, 242, 254, 0.2)',
        'neon-card': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
      // 🌟 TIPOGRAFÍA MODERNA
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        títulos: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}