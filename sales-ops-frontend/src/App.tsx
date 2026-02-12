import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import ListView from './pages/ListView';
import Graphs from './components/graphs'; // ← CORREGIDO: mayúscula G (React requiere componentes en mayúscula)
import { LayoutDashboard, List, BarChart3 } from 'lucide-react';

function App() {
  const [view, setView] = useState<'tablero' | 'lista' | 'graphs'>('tablero');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      {/* Sidebar izquierdo */}
      <aside className="w-16 bg-[#141414] border-r border-gray-800 flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="w-10 h-10 bg-[#3a4a3a] rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>

        {/* Botones menú */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setView('tablero')}
            className={`p-3 rounded-lg transition-all ${
              view === 'tablero' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1f1f1f]'
            }`}
            title="Tablero"
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>

          <button
            onClick={() => setView('lista')}
            className={`p-3 rounded-lg transition-all ${
              view === 'lista' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1f1f1f]'
            }`}
            title="Lista"
          >
            <List className="w-6 h-6" />
          </button>

          <button
            onClick={() => setView('graphs')}
            className={`p-3 rounded-lg transition-all ${
              view === 'graphs' ? 'bg-[#2a2a2a] text-white' : 'text-gray-500 hover:text-white hover:bg-[#1f1f1f]'
            }`}
            title="Gráficas"
          >
            <BarChart3 className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#141414] border-b border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">Mejikai</h1>
              <p className="text-gray-500 text-[10px]">CRM Comer. • B2G</p>
            </div>

            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors"
              />
            </div>

            <div className="text-xs text-gray-400">
              {view === 'tablero' && 'Tablero'}
              {view === 'lista' && 'Lista'}
              {view === 'graphs' && 'Gráficas'}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto">
          {view === 'tablero' ? <Dashboard /> : view === 'lista' ? <ListView /> : <Graphs />} {/* ← CORREGIDO: mayúscula G */}
        </main>
      </div>
    </div>
  );
}

export default App;