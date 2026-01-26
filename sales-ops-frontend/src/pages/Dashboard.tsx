import { useQuery } from '@tanstack/react-query';
import { getGroupedOpportunities } from '../services/api';

const columnsConfig = [
  { id: 'en_cola', title: 'En cola ' },
  { id: 'en_cotizacion', title: 'En cotización ' },
  { id: 'cotizacion_enviada', title: 'Cotización enviada ' },
  { id: 'ganado', title: 'Ganado ' },
  { id: 'pago', title: 'Pago ' },
];

export default function Dashboard() {
  const { data: grouped, isLoading } = useQuery({
    queryKey: ['groupedOpportunities'],
    queryFn: getGroupedOpportunities,
    refetchInterval: 60000, // refresco cada 60s para TV
  });

  if (isLoading) return (
    <div className="text-7xl font-bold text-center mt-40 text-white animate-pulse">
      Cargando tablero...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 md:p-16 font-['Inter']">
      <h1 className="text-7xl md:text-9xl font-extrabold text-center mb-20 tracking-wide drop-shadow-2xl">
        Mejikai CRM
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
        {columnsConfig.map((column) => {
          const items = grouped?.[column.id]?.items || [];

          // Ordenar por SLA más urgente primero (vence antes)
          const sortedItems = [...items].sort((a, b) => {
            const timeA = a.slaDueDate ? new Date(a.slaDueDate).getTime() : Infinity;
            const timeB = b.slaDueDate ? new Date(b.slaDueDate).getTime() : Infinity;
            return timeA - timeB;
          });

          return (
            <div key={column.id} className="flex flex-col h-full">
              <h2 className="text-5xl md:text-6xl font-bold text-center mb-8 bg-gray-800 py-6 rounded-t-3xl shadow-2xl">
                {column.title} ({sortedItems.length})
              </h2>

              <div className="flex-1 space-y-8 overflow-hidden pr-4">
                {sortedItems.map((opp: any) => {
                  const dueDate = opp.slaDueDate ? new Date(opp.slaDueDate) : null;
                  const now = new Date();
                  let slaText = 'Sin SLA';
                  let slaColor = 'text-gray-400 text-3xl';

                  if (dueDate) {
                    const diffMs = dueDate.getTime() - now.getTime();
                    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

                    if (diffMs < 0) {
                      slaText = 'VENCIDO';
                      slaColor = 'text-red-600 font-extrabold text-4xl animate-pulse tracking-wide';
                    } else if (diffHours <= 2) {
                      slaText = `VENCE EN ${diffHours} HORAS`;
                      slaColor = 'text-yellow-400 font-extrabold text-4xl';
                    } else {
                      slaText = `VENCE EN ${diffHours} HORAS`;
                      slaColor = 'text-green-400 text-3xl';
                    }
                  }

                  return (
                    <div
                      key={opp.id}
                      className="bg-gray-800 p-8 rounded-3xl shadow-2xl border-l-8 transition-all hover:scale-[1.02]"
                      style={{
                        borderLeftColor: opp.prioridad === 'urgente' ? '#b91c1c' : '#f59e0b',
                      }}
                    >
                      <p className="font-bold text-3xl truncate mb-4">
                        {opp.asunto?.substring(0, 35) || 'Sin título'}
                      </p>
                      <p className="text-2xl text-gray-300 mb-4">
                        {opp.empresaRuc || 'N/A'}
                      </p>
                      <p className="text-2xl mb-4">
                        Prioridad: <span className={opp.prioridad === 'urgente' ? 'text-red-400 font-extrabold' : 'text-yellow-400 font-extrabold'}>
                          {(opp.prioridad || 'media').toUpperCase()}
                        </span>
                      </p>
                      <p className={`text-2xl ${slaColor}`}>
                        {slaText}
                      </p>
                      <p className="text-2xl mt-4 text-gray-400">
                        Resp: {opp.responsableId?.substring(0, 3) || '-'}
                      </p>
                      {/* Iconos */}
                      <div className="flex gap-6 mt-6 text-5xl">
                        {opp.attachments?.length > 0 && <span title="Adjunto PDF/DOC/ZIP">📎</span>}
                        {opp.ocSiaf && <span title="OC/SIAF emitida">📄</span>}
                        {opp.pago && <span title="Pago registrado">💸</span>}
                        {opp.conformidad && <span title="Conformidad">✅</span>}
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