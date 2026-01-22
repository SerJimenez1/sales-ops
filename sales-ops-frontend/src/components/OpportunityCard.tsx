import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function OpportunityCard({ opp }: { opp: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: opp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderLeftColor: opp.prioridad === 'urgente' ? '#ef4444' : '#f59e0b',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-5 rounded-xl shadow-lg border-l-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-grab active:cursor-grabbing"
    >
      <p className="font-bold text-xl mb-2 truncate">{opp.asunto || 'Sin asunto'}</p>
      <p className="text-gray-700 mb-2">{opp.remitente || 'Sin remitente'}</p>
      <div className="text-sm text-gray-600 mb-2">
        <span className="font-semibold">Empresa:</span> {opp.empresaRuc || 'N/A'}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">Prioridad:</span>
        <span className={`font-bold px-3 py-1 rounded-full ${
          opp.prioridad === 'urgente' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {opp.prioridad || 'media'}
        </span>
      </div>
      <div className="mt-3 text-sm">
        <span className="font-semibold">SLA:</span>{' '}
        <span className={`font-bold ${
          new Date(opp.slaDueDate) < new Date()
            ? 'text-red-700 animate-pulse'
            : new Date(opp.slaDueDate).getTime() - Date.now() < 2 * 60 * 60 * 1000
            ? 'text-yellow-700'
            : 'text-green-700'
        }`}>
          Vence {new Date(opp.slaDueDate).toLocaleString('es-PE')}
        </span>
      </div>
    </div>
  );
}