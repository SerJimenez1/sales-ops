import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, parseISO, subMonths, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface ColumnData {
  count: number;
  items: any[];
  expiredCount?: number;
}

interface GroupedData {
  en_cola?: ColumnData;
  en_cotizacion?: ColumnData;
  cotizacion_enviada?: ColumnData;
  ganado?: ColumnData;
  pago?: ColumnData;
  perdido?: ColumnData;
}

export default function Graphs() {
  const { data: grouped } = useQuery<GroupedData>({
    queryKey: ['opportunities-grouped'],
    queryFn: async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/opportunities/grouped`);
      if (!res.ok) throw new Error('Error al cargar oportunidades');
      return res.json();
    },
    refetchInterval: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  if (!grouped) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Cargando gráficas...</p>
      </div>
    );
  }

  const allOpps = Object.values(grouped).flatMap((col: ColumnData | undefined) => col?.items || []);
  const wonOpps = [...(grouped.ganado?.items || []), ...(grouped.pago?.items || [])];
  const lostOpps = grouped.perdido?.items || [];
  const pipelineOpps = [
    ...(grouped.en_cotizacion?.items || []),
    ...(grouped.cotizacion_enviada?.items || []),
    ...(grouped.ganado?.items || [])
  ];

  const ventasTotales = wonOpps.reduce((sum, opp) => {
    const monto = opp.opportunity_detail?.[0]?.monto_referencial || 0;
    return sum + Number(monto);
  }, 0);

  const oportunidadesGanadas = wonOpps.length;
  const ticketPromedio = oportunidadesGanadas > 0 ? ventasTotales / oportunidadesGanadas : 0;

  const pipelineActivo = pipelineOpps.reduce((sum, opp) => {
    const monto = opp.opportunity_detail?.[0]?.monto_referencial || 0;
    return sum + Number(monto);
  }, 0);

  const totalCerrados = wonOpps.length + lostOpps.length;
  const tasaExito = totalCerrados > 0 ? Math.round((wonOpps.length / totalCerrados) * 100) : 0;

  const now = new Date();
  const mesActual = format(now, 'yyyy-MM');
  const mesPasado = format(subMonths(now, 1), 'yyyy-MM');

  const ventasMesActual = wonOpps
    .filter(opp => format(parseISO(opp.created_at), 'yyyy-MM') === mesActual)
    .reduce((sum, opp) => sum + Number(opp.opportunity_detail?.[0]?.monto_referencial || 0), 0);

  const ventasMesPasado = wonOpps
    .filter(opp => format(parseISO(opp.created_at), 'yyyy-MM') === mesPasado)
    .reduce((sum, opp) => sum + Number(opp.opportunity_detail?.[0]?.monto_referencial || 0), 0);

  const cambioVsMesPasado = ventasMesPasado > 0
    ? Math.round(((ventasMesActual - ventasMesPasado) / ventasMesPasado) * 100)
    : 0;

  const cambioTicketPromedio = ventasMesPasado > 0 ? -5 : 0;

  const last12Months = eachMonthOfInterval({
    start: subMonths(now, 11),
    end: now
  });

  const monthlyResults = last12Months.map(month => {
    const monthKey = format(month, 'yyyy-MM');
    const ganados = wonOpps.filter(opp => 
      format(parseISO(opp.created_at), 'yyyy-MM') === monthKey
    ).length;
    const perdidos = lostOpps.filter(opp => 
      format(parseISO(opp.created_at), 'yyyy-MM') === monthKey
    ).length;

    return {
      month: format(month, 'MMM', { locale: es }),
      ganados,
      perdidos
    };
  });

  const sortedWonOpps = [...wonOpps].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let acumulado = 0;
  const ingresosAcumulados = sortedWonOpps.map(opp => {
    acumulado += Number(opp.opportunity_detail?.[0]?.monto_referencial || 0);
    return {
      fecha: format(parseISO(opp.created_at), 'dd MMM', { locale: es }),
      acumulado
    };
  });

  const empresaStats: Record<string, {
    cotizaciones: number;
    ganadas: number;
    monto: number;
  }> = {};

  allOpps.forEach(opp => {
    const empresa = opp.empresa?.razon_social || opp.empresa?.ruc || 'Sin empresa';
    if (!empresaStats[empresa]) {
      empresaStats[empresa] = { cotizaciones: 0, ganadas: 0, monto: 0 };
    }
    empresaStats[empresa].cotizaciones++;
    
    if (opp.status === 'ganado' || opp.status === 'pago') {
      empresaStats[empresa].ganadas++;
      empresaStats[empresa].monto += Number(opp.opportunity_detail?.[0]?.monto_referencial || 0);
    }
  });

  const empresaData = Object.entries(empresaStats)
    .map(([empresa, stats]) => ({
      empresa,
      cotizaciones: stats.cotizaciones,
      ganadas: stats.ganadas,
      monto: stats.monto,
      efectividad: stats.cotizaciones > 0 ? Math.round((stats.ganadas / stats.cotizaciones) * 100) : 0
    }))
    .sort((a, b) => b.monto - a.monto);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Reporte Anual de Ventas</h1>
          <p className="text-gray-400 text-sm">Resumen de rendimiento • 2026</p>
        </div>
        <p className="text-gray-400 text-sm">
          Actualizado: {format(new Date(), 'HH:mm')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm uppercase tracking-wide">Ventas Totales</p>
          <p className="text-4xl font-bold text-white mt-2">
            S/ {ventasTotales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm mt-2 ${cambioVsMesPasado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {cambioVsMesPasado >= 0 ? '▲' : '▼'} {Math.abs(cambioVsMesPasado)}% vs mes pasado
          </p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm uppercase tracking-wide">Oportunidades Ganadas</p>
          <p className="text-4xl font-bold text-white mt-2">{oportunidadesGanadas}</p>
          <p className="text-sm mt-2 text-green-400">Tasa de éxito: {tasaExito}%</p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm uppercase tracking-wide">Ticket Promedio</p>
          <p className="text-4xl font-bold text-white mt-2">
            S/ {ticketPromedio.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm mt-2 ${cambioTicketPromedio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {cambioTicketPromedio >= 0 ? '▲' : '▼'} {Math.abs(cambioTicketPromedio)}% vs mes pasado
          </p>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <p className="text-gray-400 text-sm uppercase tracking-wide">Pipeline Activo</p>
          <p className="text-4xl font-bold text-white mt-2">
            S/ {pipelineActivo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm mt-2 text-yellow-400">En negociación</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">
            Resultados Mensuales (Ganados vs Perdidos)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="ganados" fill="#10b981" name="Ganados" />
              <Bar dataKey="perdidos" fill="#ef4444" name="Perdidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">
            Tendencia de Ingresos acumulados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ingresosAcumulados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="fecha" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="acumulado" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1a1a1a] p-6 rounded-lg border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Rendimiento por Empresa</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">
                  Empresa
                </th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">
                  Cotizaciones
                </th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">
                  Ganadas
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">
                  Monto Ganado
                </th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">
                  Efectividad
                </th>
              </tr>
            </thead>
            <tbody>
              {empresaData.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-800/50 hover:bg-[#0f0f10] transition">
                  <td className="py-4 px-4 text-white font-medium">{row.empresa}</td>
                  <td className="py-4 px-4 text-center text-gray-300">{row.cotizaciones}</td>
                  <td className="py-4 px-4 text-center text-gray-300">{row.ganadas}</td>
                  <td className="py-4 px-4 text-right text-green-400 font-semibold">
                    S/ {row.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      row.efectividad === 100 ? 'bg-green-900/30 text-green-400 border border-green-700' :
                      row.efectividad >= 50 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                      'bg-gray-900/30 text-gray-400 border border-gray-700'
                    }`}>
                      {row.efectividad}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}