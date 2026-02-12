import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
}

export default function OpportunityDetailModal({ isOpen, onClose, opportunity }: OpportunityDetailModalProps) {
  const queryClient = useQueryClient();

  const [detail, setDetail] = useState<any>(opportunity?.opportunity_detail?.[0] || {
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
      queryClient.invalidateQueries({ queryKey: ['opportunities-grouped'] });
      onClose();
    } catch (err) {
      alert('Error al guardar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const empresaId = opportunity?.empresa_id;

  // ✅ CAMBIO PRINCIPAL: useQuery para currentOpportunity
  const { data: currentOpportunity, refetch: refetchOpportunity } = useQuery({
    queryKey: ['opportunity', opportunity.id],
    queryFn: async () => {
      const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}`);
      if (!res.ok) throw new Error('Error al cargar oportunidad');
      return res.json();
    },
    initialData: opportunity,
  });

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

  const { data: proveedores, isLoading: proveedoresLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const res = await fetch('http://192.168.18.6:3000/opportunities/proveedores');
      if (!res.ok) throw new Error('Error al cargar proveedores');
      return res.json();
    },
  });

  // ✅ Carga de pagos
  const { data: pagos, isLoading: pagosLoading, refetch: refetchPagos } = useQuery({
    queryKey: ['pagos', opportunity.id],
    queryFn: async () => {
      const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}/pagos`);
      if (!res.ok) throw new Error('Error al cargar pagos');
      return res.json();
    },
  });

  // Formulario nuevo pago
  const [nuevoPago, setNuevoPago] = useState({
    estado: 'pagado',
    monto: '',
    fecha_pago: '',
    metodo: '',
    banco: '',
    numero_operacion: '',
  });

  const handleNuevoPagoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoPago((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarPago = async () => {
    try {
      const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoPago),
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error al agregar pago: ' + (err.message || 'Error desconocido'));
        return;
      }

      alert('Pago agregado correctamente');
      await refetchOpportunity();
      await refetchPagos();
      setNuevoPago({
        estado: 'pagado',
        monto: '',
        fecha_pago: '',
        metodo: '',
        banco: '',
        numero_operacion: '',
      });
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // Subir evidencia para un pago específico
  const handleUploadEvidencia = async (file: File) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'evidencia_pago');
      formData.append('origen', 'manual');
      formData.append('opportunity_id', opportunity.id); // ← usa opportunity.id (siempre existe)

      const res = await fetch(`http://192.168.18.6:3000/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error al subir evidencia: ' + (err.message || 'Error desconocido'));
        return;
      }

      alert('Evidencia subida correctamente');
      await refetchOpportunity();
      queryClient.invalidateQueries({ queryKey: ['opportunities-grouped'] });
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // ✅ Subir cotización del proveedor
  const handleUploadCotizacion = async (file: File) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', 'cotizacion');
      formData.append('origen', 'manual');
      formData.append('opportunity_id', opportunity.id); // ← usa opportunity.id (siempre existe)

      const res = await fetch(`http://192.168.18.6:3000/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert('Error al subir cotización: ' + (err.message || 'Error desconocido'));
        return;
      }

      alert('Cotización subida correctamente');
      await refetchOpportunity();
      queryClient.invalidateQueries({ queryKey: ['opportunities-grouped'] });
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-[#0f0f10] rounded-xl p-6 text-white border border-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold mb-4">
            Detalle: {currentOpportunity?.asunto || 'Sin título'}
          </Dialog.Title>

          {/* Proveedor vinculado */}
          {currentOpportunity?.proveedor && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Proveedor vinculado:</strong> {currentOpportunity.proveedor.razon_social}
                {currentOpportunity.proveedor.ruc && ` (RUC: ${currentOpportunity.proveedor.ruc})`}
              </p>
            </div>
          )}

          {/* Datos del correo */}
          <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Correo original</h3>
            <p><strong>Remitente:</strong> {currentOpportunity?.remitente || 'N/A'}</p>
            <p><strong>Asunto:</strong> {currentOpportunity?.asunto || 'N/A'}</p>
            <p><strong>Fecha:</strong> {currentOpportunity?.created_at ? new Date(currentOpportunity.created_at).toLocaleString() : 'N/A'}</p>
            <p className="mt-2 whitespace-pre-wrap text-gray-300">{currentOpportunity?.body || 'Sin cuerpo'}</p>
          </div>

          {/* Campos manuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entidad / Área usuaria</label>
              <input name="entidad_area" value={detail.entidad_area} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Objeto del requerimiento</label>
              <input name="objeto" value={detail.objeto} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha límite de presentación</label>
              <input type="datetime-local" name="fecha_limite_presentacion" value={detail.fecha_limite_presentacion} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lugar de entrega/servicio</label>
              <input name="lugar_entrega_servicio" value={detail.lugar_entrega_servicio} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monto referencial</label>
              <input type="number" name="monto_referencial" value={detail.monto_referencial} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
              <textarea name="observaciones" value={detail.observaciones} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white h-24 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Adjuntos */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Documentos adjuntos</h3>
            {currentOpportunity?.attachments?.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-300">
                {currentOpportunity.attachments.map((att: any) => (
                  <li key={att.id}>
                    {att.tipo === 'cotizacion' ? 'Cotización: ' : att.tipo === 'evidencia_pago' ? 'Evidencia pago: ' : ''}{att.file_name} ({att.tipo || 'archivo'}) - 
                    <a href={`https://eitjcykqheiytqzhewrt.supabase.co/storage/v1/object/public/attachments/${att.storage_key}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-2">
                      Ver
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No hay adjuntos aún</p>
            )}
          </div>

          {/* Formatos disponibles */}
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
                        href={`https://eitjcykqheiytqzhewrt.supabase.co/storage/v1/object/public/templates/${tmpl.storage_key}`}
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
                            await refetchOpportunity();
                            queryClient.invalidateQueries({ queryKey: ['opportunities-grouped'] });
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

          {/* Proveedores disponibles */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Proveedores disponibles</h3>
            {proveedoresLoading ? (
              <p className="text-gray-500">Cargando proveedores...</p>
            ) : proveedores?.length === 0 ? (
              <p className="text-gray-500">No hay proveedores registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proveedores.map((prov: any) => (
                  <div key={prov.id} className="bg-[#1a1a1a] p-3 rounded flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{prov.razon_social}</p>
                      <p className="text-gray-400 text-sm">RUC: {prov.ruc}</p>
                      <p className="text-gray-400 text-sm">Rubro: {prov.rubro || 'N/A'}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Vincular "${prov.razon_social}" a esta oportunidad?`)) return;
                        try {
                          const res = await fetch(`http://192.168.18.6:3000/opportunities/${opportunity.id}/proveedor`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ proveedorId: prov.id, esPrincipal: true }),
                          });
                          if (!res.ok) {
                            const err = await res.json();
                            alert('Error al vincular: ' + (err.message || 'Error desconocido'));
                            return;
                          }
                          alert('Proveedor vinculado correctamente');
                          await refetchOpportunity();
                        } catch (err) {
                          alert('Error: ' + (err instanceof Error ? err.message : 'Error desconocido'));
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-sm"
                    >
                      Vincular
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subir cotización del proveedor */}
          {currentOpportunity?.proveedor && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">
                Subir cotización del proveedor ({currentOpportunity.proveedor.razon_social})
              </h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadCotizacion(file);
                }}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>
          )}

          {/* Sección de pagos */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Pagos registrados</h3>

            {pagosLoading ? (
              <p className="text-gray-500">Cargando pagos...</p>
            ) : pagos?.length === 0 ? (
              <p className="text-gray-500">No hay pagos registrados</p>
            ) : (
              <div className="space-y-4">
                {pagos.map((pago: any) => (
                  <div key={pago.id} className="bg-[#1a1a1a] p-4 rounded-lg">
                    <p><strong>Estado:</strong> {pago.estado}</p>
                    <p><strong>Monto:</strong> S/ {pago.monto}</p>
                    <p><strong>Fecha:</strong> {pago.fecha_pago}</p>
                    <p><strong>Método:</strong> {pago.metodo}</p>
                    <p><strong>Banco:</strong> {pago.banco}</p>
                    <p><strong>Operación:</strong> {pago.numero_operacion}</p>
                    {pago.evidencia_id && (
                      <p>Evidencia: <a href={`https://eitjcykqheiytqzhewrt.supabase.co/storage/v1/object/public/attachments/${pago.evidencia.storage_key}`} target="_blank" className="text-blue-400">Ver</a></p>
                    )}
                    {/* Botón subir evidencia si no tiene */}
                    {!pago.evidencia_id && (
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadEvidencia(file);
                        }}
                        className="mt-2 block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <h3 className="text-lg font-semibold mt-6 mb-2">Agregar nuevo pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estado</label>
                <select name="estado" value={nuevoPago.estado} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white">
                  <option value="por_facturar">Por facturar</option>
                  <option value="por_pagar">Por pagar</option>
                  <option value="pagado">Pagado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Monto</label>
                <input type="number" name="monto" value={nuevoPago.monto} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha de pago</label>
                <input type="date" name="fecha_pago" value={nuevoPago.fecha_pago} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Método</label>
                <select name="metodo" value={nuevoPago.metodo} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white">
                  <option value="">Seleccionar</option>
                  <option value="depósito">Depósito</option>
                  <option value="yape">Yape</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Banco</label>
                <input type="text" name="banco" value={nuevoPago.banco} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Número de operación</label>
                <input type="text" name="numero_operacion" value={nuevoPago.numero_operacion} onChange={handleNuevoPagoChange} className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-2 text-white" />
              </div>
            </div>
            <button
              onClick={handleAgregarPago}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500"
            >
              Agregar pago
            </button>
          </div>

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