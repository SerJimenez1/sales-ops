import { useState } from 'react';
import Dashboard from './Dashboard';
import ListView from './ListView';

function Board() {
  const [view, setView] = useState<'kanban' | 'lista'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header - ULTRA COMPACTO */}
      <header className="bg-[#141414] border-b border-gray-800 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Logo - Izquierda */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-[#3a4a3a] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
          </div>

          {/* Buscador - Centro */}
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors"
            />
          </div>

          {/* Botones de Vista - Derecha */}
          <div className="flex items-center gap-0.5 bg-[#1a1a1a] rounded p-0.5 flex-shrink-0">
            <button
              onClick={() => setView('kanban')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                view === 'kanban'
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tablero
            </button>
            <button
              onClick={() => setView('lista')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                view === 'lista'
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main>
        {view === 'kanban' ? <Dashboard /> : <ListView />}
      </main>
    </div>
  );
}

export default Board;