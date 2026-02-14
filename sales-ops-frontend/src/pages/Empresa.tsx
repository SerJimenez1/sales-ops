// src/pages/Empresas.tsx  (o Empresa.tsx si lo renombraste)
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Empresa {
  id: string;
  razon_social: string;
  ruc: string;
  email_oportunidades?: string;
  activo: boolean;
}

export default function Empresas() {
  const queryClient = useQueryClient();

  // Estado del formulario
  const [formData, setFormData] = useState({
    razon_social: '',
    ruc: '',
    email_oportunidades: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cargar lista de empresas
  const { data: empresas, isLoading } = useQuery<Empresa[]>({
    queryKey: ['empresas'],
    queryFn: async () => {
      const res = await fetch('http://192.168.18.6:3000/opportunities/empresas');
      if (!res.ok) throw new Error('Error al cargar empresas');
      return res.json();
    },
  });

  // Mutación para crear empresa
  const createMutation = useMutation({
    mutationFn: async (newEmpresa: any) => {
      const res = await fetch('http://192.168.18.6:3000/opportunities/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEmpresa, activo: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al registrar empresa');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      alert('Empresa registrada correctamente');
      setFormData({
        razon_social: '',
        ruc: '',
        email_oportunidades: '',
      });
    },
    onError: (err: any) => {
      alert('Error: ' + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social || !formData.ruc) { // ✅ CORREGIDO: era "razor_social" (typo)
      alert('Razón social y RUC son obligatorios');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestión de Empresas</h1>

      {/* Formulario de registro */}
      <div className="bg-[#141414] rounded-lg p-6 mb-10 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Registrar nueva empresa</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Empresa *</label>
            <input
              name="razon_social"
              value={formData.razon_social}
              onChange={handleInputChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: Claro Perú S.A."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">RUC *</label>
            <input
              name="ruc"
              value={formData.ruc}
              onChange={handleInputChange}
              required
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: 20123456789"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Email de oportunidades</label>
            <input
              type="email"
              name="email_oportunidades"
              value={formData.email_oportunidades}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Ej: oportunidades@empresa.com.pe"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold disabled:opacity-70"
            >
              {createMutation.isPending ? 'Registrando...' : 'Registrar empresa'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de empresas */}
      <div className="bg-[#141414] rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Lista de empresas registradas</h2>
        {isLoading ? (
          <p className="text-gray-400">Cargando empresas...</p>
        ) : empresas?.length === 0 ? (
          <p className="text-gray-500">No hay empresas registradas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="py-3 px-4 text-gray-400 text-sm">RUC</th>
                  <th className="py-3 px-4 text-gray-400 text-sm">Empresa</th>
                  <th className="py-3 px-4 text-gray-400 text-sm">Email oportunidades</th>
                </tr>
              </thead>
              <tbody>
                {empresas?.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-800 hover:bg-[#1a1a1a]">
                    <td className="py-3 px-4">{emp.ruc}</td>
                    <td className="py-3 px-4">{emp.razon_social}</td>
                    <td className="py-3 px-4">{emp.email_oportunidades || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}