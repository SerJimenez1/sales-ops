/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cola': '#e0f2fe',
          'cotizacion': '#fef3c7',
          'enviada': '#d1fae5',
          'ganado': '#d1fae5',
          'pago': '#fee2e2',
          'urgente': '#ef4444',
          'media': '#f59e0b',
          'baja': '#10b981',
          'vencido': '#dc2626',
          'warning': '#f59e0b',
        },
        animation: {
          'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
      },
    },
    plugins: [],
  }