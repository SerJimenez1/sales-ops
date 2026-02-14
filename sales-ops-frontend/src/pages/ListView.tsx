import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const ListView = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingResponsable, setEditingResponsable] = useState<string | null>(null);

  // ✅ Cargar usuarios (encargados posibles)
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const res = await fetch('http://192.168.18.6:3000/opportunities/users');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      return res.json();
    },
  });

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

  // ✅ Handler para cambiar responsable
  const handleChangeResponsable = async (oppId: string, newResponsableId: string | null) => {
    try {
      const res = await fetch(`http://192.168.18.6:3000/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable_id: newResponsableId || null }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error al asignar encargado: ' + (err.message || 'Error desconocido'));
        return;
      }

      alert('Encargado asignado correctamente');
      fetchData();
      setEditingResponsable(null);
    } catch (err) {
      alert('Error al asignar encargado');
    }
  };

  if (initialLoading) {
    return <div className="text-center py-10 text-white animate-pulse">Cargando lista...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-400">Error: {error}</div>;
  }

  const getStatusStyle = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'ganado': { bg: 'bg-green-500/20', text: 'text-green-400', label: 'GANADO' },
      'en_cotizacion': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'EN COTIZACIÓN' },
      'cotizacion_enviada': { bg: 'bg-yellow-600/20', text: 'text-yellow-500', label: 'COTIZADO' },
      'en_cola': { bg: 'bg-yellow-700/20', text: 'text-yellow-600', label: 'EN REVISIÓN' },
      'pago': { bg: 'bg-green-400/20', text: 'text-green-300', label: 'PAGADO' },
      'perdido': { bg: 'bg-red-500/20', text: 'text-red-400', label: 'PERDIDO' },
      'por_pagar': { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'POR PAGAR' },
    };
    
    return statusMap[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400', label: status.toUpperCase() };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-1">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#0a0a0a] z-10 border-b border-gray-700">
            <tr>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">COTI</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">EMPRESA</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">ENTIDAD</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">CONCEPTO</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">PRECIO</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">ESTADO</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">PROVEEDOR</th>
              <th className="py-1 px-2 text-gray-400 font-bold text-xs uppercase tracking-wider">ENCARGADO</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500 text-xs">Sin oportunidades</td>
              </tr>
            ) : (
              opportunities.map((opp) => {
                const statusStyle = getStatusStyle(opp.status);
                const iniciales = opp.responsable?.nombre?.substring(0, 2).toUpperCase() || 'XX';
                const nombreActual = opp.responsable?.nombre || 'Sin asignar';

                return (
                  <tr 
                    key={opp.id} 
                    className="border-b border-gray-800 hover:bg-[#141414] transition-colors h-10"
                  >
                    <td className="px-2">
                      <span className="text-white font-mono text-sm font-bold">
                        COT-{opp.id.slice(-4)}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className="text-white font-bold text-xs uppercase">
                        {opp.empresa?.razon_social || opp.empresa?.ruc || 'Sin empresa'}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className="text-gray-300 text-xs">
                        {opp.entidad_publica?.razon_social || opp.entidad_publica?.ruc || 'Sin entidad'}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className="text-white text-xs">
                        {opp.asunto}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className="text-green-400 font-bold text-xs">
                        {opp.precio_referencial != null 
                          ? `S/ ${Number(opp.precio_referencial).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : '-'}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase ${statusStyle.bg} ${statusStyle.text} border border-current/30`}>
                        {statusStyle.label}
                      </span>
                    </td>

                    <td className="px-2">
                      <span className="text-purple-400 text-xs">
                        {opp.proveedor?.razon_social || 'Ninguno'}
                      </span>
                    </td>

                    <td className="px-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-gray-700 text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                          {iniciales}
                        </span>

                        {editingResponsable === opp.id ? (
                          <select
                            autoFocus
                            defaultValue={opp.responsable_id || ''}
                            onChange={(e) => {
                              const value = e.target.value || null;
                              handleChangeResponsable(opp.id, value);
                            }}
                            onBlur={() => setEditingResponsable(null)}
                            className="bg-[#1a1a1a] border border-gray-700 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Sin asignar</option>
                            {usuarios.map((user: any) => (
                              <option key={user.id} value={user.id}>
                                {user.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            onClick={() => setEditingResponsable(opp.id)}
                            className="text-gray-300 text-xs cursor-pointer hover:text-white hover:underline"
                          >
                            {nombreActual}
                          </span>
                        )}
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