import { useQuery } from '@tanstack/react-query';
import { getGroupedOpportunities } from '../services/api';  // ← este import ahora debería funcionar
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const columnsConfig = [
  { id: 'en_cola', title: 'En cola', bg: 'bg-blue-100' },
  { id: 'en_cotizacion', title: 'En cotización', bg: 'bg-yellow-100' },
  { id: 'cotizacion_enviada', title: 'Cotización enviada', bg: 'bg-green-100' },
  { id: 'ganado', title: 'Ganado', bg: 'bg-emerald-100' },
  { id: 'pago', title: 'Pago', bg: 'bg-red-100' },
];

export default function Dashboard() {
  const { data: grouped, isLoading, error } = useQuery<Record<string, { items: any[]; count: number; expiredCount: number }>>({
    queryKey: ['groupedOpportunities'],
    queryFn: getGroupedOpportunities,
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="p-8 text-center text-3xl">Cargando tablero...</div>;

  if (error) return (
    <div className="p-8 text-center text-red-600 text-2xl">
      Error al cargar: {error.message || 'Desconocido'}
    </div>
  );

  if (!grouped || typeof grouped !== 'object') return (
    <div className="p-8 text-center text-yellow-600 text-2xl">
      Datos inválidos del backend
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      {/* PRUEBA DE FUEGO */}
      <div className="bg-red-600 text-white text-6xl font-extrabold p-10 text-center animate-bounce mb-8">
        ¡TAILWIND FUNCIONA! Rojo grande y saltando
      </div>

      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
        Tablero Comercial - Sales Ops
      </h1>

      <DndContext collisionDetection={closestCenter}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {columnsConfig.map((column) => {
            const columnData = grouped[column.id] || { items: [], count: 0, expiredCount: 0 };
            const items = columnData.items || [];

            return (
              <div
                key={column.id}
                className={`p-4 rounded-xl shadow-md ${column.bg} border border-gray-200`}
              >
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
                  {column.title} 
                  <span className="text-sm font-normal ml-2">
                    ({columnData.count} total, {columnData.expiredCount} vencidas)
                  </span>
                </h2>

                <SortableContext
                  items={items.map((opp: any) => opp.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4 min-h-[300px]">
                    {items.map((opp: any) => (
                      <div
                        key={opp.id}
                        className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-lg transition-shadow"
                      >
                        <p className="font-medium text-lg">{opp.asunto || 'Sin asunto'}</p>
                        <p className="text-sm text-gray-600 mt-1">{opp.remitente || 'Sin remitente'}</p>
                        <div className="mt-2 text-sm">
                          <span className="font-semibold">Empresa:</span> {opp.empresaRuc || 'N/A'}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-semibold">Prioridad:</span>{' '}
                          <span className={opp.prioridad === 'urgente' ? 'text-red-600 font-bold' : 'text-yellow-600 font-bold'}>
                            {opp.prioridad || 'media'}
                          </span>
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="font-semibold">SLA:</span>{' '}
                          <span className={
                            new Date(opp.slaDueDate) < new Date()
                              ? 'text-red-600 font-bold animate-pulse'
                              : new Date(opp.slaDueDate).getTime() - Date.now() < 2 * 60 * 60 * 1000
                              ? 'text-yellow-600 font-bold'
                              : 'text-green-600'
                          }>
                            Vence {new Date(opp.slaDueDate).toLocaleString('es-PE')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}