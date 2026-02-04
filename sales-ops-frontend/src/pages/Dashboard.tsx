import { useQuery } from '@tanstack/react-query';
import { getGroupedOpportunities } from '../services/api';

const columnsConfig = [
  { id: 'en_cola', title: 'En Revisión', color: 'bg-[#1a1a1a]' },
  { id: 'en_cotizacion', title: 'En Cotización', color: 'bg-[#1a1a1a]' },
  { id: 'cotizacion_enviada', title: 'Cotizado', color: 'bg-[#1a1a1a]' },
  { id: 'ganado', title: 'Ganado', color: 'bg-[#1a1a1a]' },
  { id: 'pago', title: 'Pago', color: 'bg-[#1a1a1a]' },
];

export default function Dashboard() {
  const { data: grouped, isLoading } = useQuery({
    queryKey: ['groupedOpportunities'],
    queryFn: getGroupedOpportunities,
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white text-sm animate-pulse">
      Cargando...
    </div>
  );

  return (
    <div className="h-screen bg-[#0a0a0a] text-white px-2 py-2 font-sans flex flex-col">
      {/* Sin título - eliminado */}
      
      <div className="flex gap-1.5 overflow-x-auto flex-1">
        {columnsConfig.map((column) => {
          const items = grouped?.[column.id]?.items || [];

          const sortedItems = [...items].sort((a, b) => {
            const timeA = a.slaDueDate ? new Date(a.slaDueDate).getTime() : Infinity;
            const timeB = b.slaDueDate ? new Date(b.slaDueDate).getTime() : Infinity;
            return timeA - timeB;
          });

          return (
            <div key={column.id} className="flex-shrink-0 w-46 flex flex-col h-full">
              {/* Column Header - text-xs (12px) */}
              <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
                <h2 className="text-xs font-semibold text-gray-300 flex items-center gap-1">
                  {column.title}
                  <span className="bg-[#2a2a2a] text-gray-400 text-[10px] px-1 py-0.5 rounded">
                    {sortedItems.length}
                  </span>
                </h2>
                <button className="text-gray-500 hover:text-white text-sm leading-none">+</button>
              </div>

              {/* Cards Container - Ocupa TODO el espacio disponible */}
              <div className="flex-1 space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent min-h-0">
                {sortedItems.length === 0 ? (
                  <div className="text-center text-gray-600 py-4 text-[10px]">Sin oportunidades</div>
                ) : (
                  sortedItems.map((opp: any) => {
                    const dueDate = opp.slaDueDate ? new Date(opp.slaDueDate) : null;
                    const now = new Date();
                    let slaText = '';
                    let slaColor = 'text-gray-500';

                    if (dueDate) {
                      const diffMs = dueDate.getTime() - now.getTime();
                      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

                      if (diffMs < 0) {
                        slaText = 'VENCIDO';
                        slaColor = 'text-red-400';
                      } else if (diffHours <= 2) {
                        slaText = `${diffHours}h`;
                        slaColor = 'text-yellow-400';
                      } else {
                        slaText = `${diffHours}h`;
                        slaColor = 'text-green-400';
                      }
                    }

                    return (
                      <div
                        key={opp.id}
                        className="bg-[#1a1a1a] rounded p-1 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all cursor-pointer"
                      >
                        {/* Card Header - ID: text-[7px] y Badge: text-[7px] */}
                        <div className="flex items-start justify-between mb-0.5">
                          <span className="text-[7px] text-gray-500 font-mono">
                            {opp.id?.slice(-4) || '0000'}
                          </span>
                          <span className="bg-[#2a2a2a] text-white text-[7px] px-0.5 py-0.5 rounded font-medium">
                            {opp.responsable?.name?.substring(0, 2).toUpperCase() || 'XX'}
                          </span>
                        </div>

                        {/* Card Title - text-[8px] */}
                        <h3 className="text-white text-[8px] font-semibold mb-0.5 leading-tight line-clamp-2">
                          {opp.asunto || 'Sin título'}
                        </h3>

                        {/* Company Name - text-[7px] */}
                        <p className="text-[7px] text-cyan-400 mb-1 flex items-center gap-0.5 truncate">
                          <span className="w-0.5 h-0.5 bg-cyan-400 rounded-full flex-shrink-0"></span>
                          {opp.empresaRuc || 'Sin empresa'}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-0.5 border-t border-[#2a2a2a]">
                          <div className="flex items-center gap-0.5">
                            {/* Prioridad - text-[6px] */}
                            <span className={`text-[6px] uppercase px-0.5 py-0.5 rounded ${
                              opp.prioridad === 'urgente' ? 'bg-red-900/30 text-red-400' :
                              opp.prioridad === 'baja' ? 'bg-green-900/30 text-green-400' :
                              'bg-yellow-900/30 text-yellow-400'
                            }`}>
                              {(opp.prioridad || 'MEDIA').substring(0, 3)}
                            </span>
                            {opp.attachments?.length > 0 && (
                              <span className="text-[7px]">📎</span>
                            )}
                          </div>
                          
                          {/* Monto - text-[7px] */}
                          <span className="text-green-400 text-[7px] font-bold">
                            S/ {opp.monto?.toLocaleString('es-PE') || '0'}
                          </span>
                        </div>

                        {/* SLA Indicator - text-[6px] */}
                        {slaText && (
                          <div className={`text-[6px] mt-0.5 ${slaColor}`}>
                            {slaText}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}