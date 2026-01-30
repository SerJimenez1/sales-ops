import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.18.6:3000',  // tu backend
});

export const getGroupedOpportunities = async () => {
  const response = await api.get('/opportunities/grouped');
  return response.data;
};