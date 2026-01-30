import { useQuery } from '@tanstack/react-query';
import { getGroupedOpportunities } from '../services/api';

const columnsConfig = [
  { id: 'en_cola', title: 'En cola' },
  { id: 'en_cotizacion', title: 'En cotización' },
  { id: 'cotizacion_enviada', title: 'Cotización enviada' },
  { id: 'ganado', title: 'Ganado' },
  { id: 'pago', title: 'Pago' },
];

export default function Dashboard() {
  const { data: grouped, isLoading } = useQuery({
    queryKey: ['groupedOpportunities'],
    queryFn: getGroupedOpportunities,
    refetchInterval: 60000,
  });

  if (isLoading) return (
    <div className="text-3xl font-bold text-center mt-16 text-white animate-pulse">
      Cargando tablero...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 font-sans">
      <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-8 tracking-wide drop-shadow-2xl">
        Mejikai CRM
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
        {columnsConfig.map((column) => {
          const items = grouped?.[column.id]?.items || [];

          const sortedItems = [...items].sort((a, b) => {
            const timeA = a.slaDueDate ? new Date(a.slaDueDate).getTime() : Infinity;
            const timeB = b.slaDueDate ? new Date(b.slaDueDate).getTime() : Infinity;
            return timeA - timeB;
          });

          return (
            <div key={column.id} className="flex flex-col h-full">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gray-800 py-3 rounded-t-xl shadow-lg whitespace-normal break-words">
                {column.title} ({sortedItems.length})
              </h2>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {sortedItems.map((opp: any) => {
                  const dueDate = opp.slaDueDate ? new Date(opp.slaDueDate) : null;
                  const now = new Date();
                  let slaText = 'Sin SLA';
                  let slaColor = 'text-gray-400 text-sm';

                  if (dueDate) {
                    const diffMs = dueDate.getTime() - now.getTime();
                    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

                    if (diffMs < 0) {
                      slaText = 'VENCIDO';
                      slaColor = 'text-red-600 font-extrabold text-base animate-pulse tracking-wide';
                    } else if (diffHours <= 2) {
                      slaText = `Vence en ${diffHours}h`;
                      slaColor = 'text-yellow-400 font-extrabold text-base';
                    } else {
                      slaText = `Vence en ${diffHours}h`;
                      slaColor = 'text-green-400 text-sm';
                    }
                  }

                  return (
                    <div
                      key={opp.id}
                      className="bg-gray-800 p-3.5 rounded-xl shadow-xl border-l-8 transition-all hover:scale-[1.02] min-h-[130px] flex flex-col justify-between"
                      style={{
                        borderLeftColor: opp.prioridad === 'urgente' ? '#ef4444' : '#f59e0b',
                      }}
                    >
                      <div>
                        <p className="font-bold text-base mb-1 whitespace-normal break-words leading-tight">
                          {opp.asunto || 'Sin título'}
                        </p>
                        <p className="text-xs text-gray-300 mb-1">
                          {opp.empresaRuc || 'N/A'}
                        </p>
                        <p className="text-xs mb-1">
                          Prioridad: <span className={
                            opp.prioridad === 'urgente' ? 'text-red-400 font-bold' :
                            opp.prioridad === 'baja' ? 'text-green-400 font-bold' :
                            'text-yellow-400 font-bold'
                          }>
                            {(opp.prioridad || 'media').toUpperCase()}
                          </span>
                        </p>
                        <p className={`text-xs ${slaColor}`}>
                          {slaText}
                        </p>
                        <p className="text-xs mt-1 text-gray-400">
                          Resp: {opp.responsableId?.substring(0, 3) || '-'}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-2 text-xl">
                        {opp.attachments?.length > 0 && <span title="Adjunto PDF/DOC/ZIP">📎</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}