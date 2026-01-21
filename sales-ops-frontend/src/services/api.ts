import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',  // tu backend
});

export const getGroupedOpportunities = async () => {
  const response = await api.get('/opportunities/grouped');
  return response.data;
};