import axios from 'axios';

// Usa la variable de entorno (VITE_API_URL) o fallback a local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // opcional: 10 segundos max por petición
});

export const getGroupedOpportunities = async () => {
  const response = await api.get('/opportunities/grouped');
  return response.data;
};

// Si tenés más funciones, cambialas igual (usa api en vez de fetch directo)