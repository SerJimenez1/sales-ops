import OpportunityCard from './OpportunityCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Column({ column, items }: { column: any; items: any[] }) {
  return (
    <div className={`p-6 rounded-2xl shadow-xl ${column.bg} border border-gray-200 flex flex-col h-full`}>
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 flex items-center justify-center gap-3">
        {column.title}
        <span className="text-2xl font-semibold bg-white/70 px-4 py-1 rounded-full shadow">
          {items.length}
        </span>
      </h2>

      <SortableContext
        id={column.id}
        items={items.map((opp: any) => opp.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-4 overflow-y-auto">
          {items.map((opp: any) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}