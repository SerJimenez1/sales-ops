import OpportunityCard from './OpportunityCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export default function Column({ column, items }: { column: any; items: any[] }) {
  return (
    <div className={`p-4 rounded-xl shadow-xl ${column.bg} border border-gray-200 flex flex-col h-full`}>
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 flex items-center justify-center gap-3">
        {column.title}
        <span className="text-xl font-semibold bg-white/70 px-3 py-1 rounded-full shadow">
          {items.length}
        </span>
      </h2>

      <SortableContext
        id={column.id}
        items={items.map((opp: any) => opp.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 space-y-3 overflow-y-auto">
          {items.map((opp: any) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}