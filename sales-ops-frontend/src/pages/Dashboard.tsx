import { useQuery } from '@tanstack/react-query';
import { getGroupedOpportunities } from '../services/api';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import Column from '../components/Column';

const columnsConfig = [
  { id: 'en_cola', title: 'En cola', bg: 'bg-blue-50' },
  { id: 'en_cotizacion', title: 'En cotización', bg: 'bg-yellow-50' },
  { id: 'cotizacion_enviada', title: 'Cotización enviada', bg: 'bg-green-50' },
  { id: 'ganado', title: 'Ganado', bg: 'bg-emerald-50' },
  { id: 'pago', title: 'Pago', bg: 'bg-red-50' },
];

export default function Dashboard() {
  const { data: grouped, isLoading, error } = useQuery({
    queryKey: ['groupedOpportunities'],
    queryFn: getGroupedOpportunities,
    refetchInterval: 60000,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Tarjeta movida:', event.active.id, 'a columna:', event.over?.id);
  };

  if (isLoading) return <div className="p-8 text-center text-4xl font-bold text-gray-700 animate-pulse">Cargando tablero...</div>;

  if (error) return (
    <div className="p-8 text-center text-4xl font-bold text-red-600">
      Error al cargar: {error.message || 'Desconocido'}
    </div>
  );

  if (!grouped || typeof grouped !== 'object') return (
    <div className="p-8 text-center text-4xl font-bold text-yellow-600">
      Datos inválidos del backend
    </div>
  );

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gray-50">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-12 text-center text-gray-900 tracking-tight">
        Tablero Comercial - Sales Ops
      </h1>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {columnsConfig.map((column) => {
            const items = grouped[column.id]?.items || [];

            return (
              <Column key={column.id} column={column} items={items} />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}