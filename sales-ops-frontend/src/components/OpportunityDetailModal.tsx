import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any; // Puedes tipar mejor más adelante (ej. tipo Opportunity)
}

export default function OpportunityDetailModal({ isOpen, onClose, opportunity }: OpportunityDetailModalProps) {
  const [detail, setDetail] = useState<any>(opportunity?.detail || {
    entidad_area: '',
    objeto: '',
    fecha_limite_presentacion: '',
    lugar_entrega_servicio: '',
    monto_referencial: 0,
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetail((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}/detail`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detail),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error al guardar: ' + (err.message || 'Error desconocido'));
        return;
      }

      alert('Cambios guardados con éxito');
      onClose();
    } catch (err) {
      alert('Error al guardar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // Carga de plantillas según la empresa de la oportunidad
  const empresaId = opportunity?.empresa_id;

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      const res = await fetch(`http://192.168.18.6:3000/opportunities/templates/${empresaId}`);
      if (!res.ok) throw new Error('Error al cargar plantillas');
      return res.json();
    },
    enabled: !!empresaId,
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-[#0f0f10] rounded-xl p-6 text-white border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold mb-4">
            Detalle: {opportunity?.asunto || 'Sin título'}
          </Dialog.Title>

          {/* Datos del correo - solo lectura */}
          <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Correo original</h3>
            <p><strong>Remitente:</strong> {opportunity?.remitente || 'N/A'}</p>
            <p><strong>Asunto:</strong> {opportunity?.asunto || 'N/A'}</p>
            <p><strong>Fecha:</strong> {opportunity?.created_at ? new Date(opportunity.created_at).toLocaleString() : 'N/A'}</p>
            <p className="mt-2 whitespace-pre-wrap text-gray-300">{opportunity?.body || 'Sin cuerpo'}</p>
          </div>

          {/* Campos manuales - editable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entidad / Área usuaria</label>
              <input
                name="entidad_area"
                value={detail.entidad_area}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Objeto del requerimiento</label>
              <input
                name="objeto"
                value={detail.objeto}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha límite de presentación</label>
              <input
                type="datetime-local"
                name="fecha_limite_presentacion"
                value={detail.fecha_limite_presentacion}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lugar de entrega/servicio</label>
              <input
                name="lugar_entrega_servicio"
                value={detail.lugar_entrega_servicio}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monto referencial</label>
              <input
                type="number"
                name="monto_referencial"
                value={detail.monto_referencial}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                value={detail.observaciones}
                onChange={handleChange}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white h-24 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Adjuntos - por ahora solo lista */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Documentos adjuntos</h3>
            {opportunity?.attachments?.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-300">
                {opportunity.attachments.map((att: any) => (
                  <li key={att.id}>
                    {att.file_name} ({att.tipo || 'archivo'}) - 
                    <a href={att.publicUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Ver
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay adjuntos aún</p>
            )}
          </div>

          {/* Formatos disponibles para esta empresa */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Formatos disponibles para esta empresa</h3>

            {templatesLoading ? (
              <p className="text-gray-500">Cargando formatos...</p>
            ) : templates?.length === 0 ? (
              <p className="text-gray-500">No hay formatos disponibles para esta empresa</p>
            ) : (
              <ul className="space-y-2">
                {templates.map((tmpl: any) => (
                  <li key={tmpl.id} className="flex items-center justify-between bg-[#1a1a1a] p-2 rounded">
                    <div>
                      <span className="text-white">{tmpl.nombre}</span>
                      <span className="text-gray-400 text-sm ml-2">({tmpl.tipo.toUpperCase()})</span>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={`https://eitjcykqheiytqzhewrt.supabase.co/storage/v1/object/public/${tmpl.storage_key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Descargar
                      </a>
                      <button
                        onClick={async () => {
                          if (!confirm('¿Crear copia de esta plantilla para esta oportunidad?')) return;

                          try {
                            const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}/create-template-copy`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ templateId: tmpl.id }),
                            });

                            if (!res.ok) {
                              const err = await res.json();
                              alert('Error al crear copia: ' + (err.message || 'Error desconocido'));
                              return;
                            }

                            alert('Copia creada y adjuntada correctamente!');
                            // Opcional: refresca la lista de adjuntos en el modal si quieres
                          } catch (err) {
                            alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
                          }
                        }}
                        className="text-green-400 hover:underline text-sm"
                      >
                        Crear copia
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botones con más espacio entre ellos */}
          <div className="flex justify-end gap-6 mt-8">
            <button onClick={onClose} className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
              Cancelar
            </button>
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
              Guardar cambios
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}