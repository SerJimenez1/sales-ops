import { useEffect, useState } from 'react';
import axios from 'axios';

const ListView = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      setError(null);
      const res = await axios.get('http://192.168.18.6:3000/opportunities/grouped');
      const allOpps = Object.values(res.data).flatMap((group: any) => group.items || []);
      setOpportunities(allOpps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching opportunities:', err);
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 60000);
    return () => clearInterval(interval);
  }, []);

  if (initialLoading) {
    return <div className="text-center py-10 text-white animate-pulse">Cargando lista...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-400">Error: {error}</div>;
  }

  const getStatusStyle = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'ganado': { bg: 'bg-green-500/10', text: 'text-green-400', label: 'GANADO' },
      'en_cotizacion': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'EN COTIZACIÓN' },
      'cotizacion_enviada': { bg: 'bg-yellow-600/10', text: 'text-yellow-500', label: 'COTIZADO' },
      'en_cola': { bg: 'bg-yellow-700/10', text: 'text-yellow-600', label: 'EN REVISIÓN' },
      'pago': { bg: 'bg-green-400/10', text: 'text-green-300', label: 'PAGADO' },
      'perdido': { bg: 'bg-red-500/10', text: 'text-red-400', label: 'PERDIDO' },
      'por_pagar': { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'POR PAGAR' },
    };
    
    return statusMap[status] || { bg: 'bg-gray-500/10', text: 'text-gray-400', label: status.toUpperCase() };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">COTI</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">EMPRESA</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">ENTIDAD</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">CONCEPTO</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">MONTO</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">ESTADO</th>
              <th className="pb-4 px-4 text-gray-400 font-medium text-sm uppercase tracking-wider">ENCARGADO</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">Sin oportunidades</td>
              </tr>
            ) : (
              opportunities.map((opp, index) => {
                const statusStyle = getStatusStyle(opp.status);
                
                return (
                  <tr 
                    key={opp.id} 
                    className="border-b border-gray-800/50 hover:bg-[#1a1a1a] transition-colors"
                  >
                    {/* COTI */}
                    <td className="py-4 px-4">
                      <span className="text-gray-500 font-mono text-sm">
                        COT-{opp.id.slice(-4)}
                      </span>
                    </td>

                    {/* EMPRESA */}
                    <td className="py-4 px-4">
                      <span className="text-white font-bold uppercase text-sm">
                        {opp.empresa?.razon_social || opp.empresa?.ruc || 'Sin empresa'} {/* ← CORREGIDO AQUÍ */}
                      </span>
                    </td>

                    {/* ENTIDAD */}
                    <td className="py-4 px-4">
                      <span className="text-gray-300 text-sm">
                        {opp.entidad_publica?.razon_social || opp.entidad_publica?.ruc || 'Sin entidad'} {/* ← CORREGIDO AQUÍ */}
                      </span>
                    </td>

                    {/* CONCEPTO */}
                    <td className="py-4 px-4">
                      <span className="text-white text-sm">
                        {opp.asunto}
                      </span>
                    </td>

                    {/* MONTO */}
                    <td className="py-4 px-4">
                      <span className="text-green-400 font-semibold text-sm">
                        S/ {(opp.monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* ESTADO */}
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold uppercase ${statusStyle.bg} ${statusStyle.text} border border-current/20`}>
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* ENCARGADO */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
                          {opp.responsable?.nombre?.substring(0, 2).toUpperCase() || 'XX'}  
                        </span>
                        <span className="text-gray-300 text-sm">
                          {opp.responsable?.nombre || 'Sin asignar'}  
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListView;