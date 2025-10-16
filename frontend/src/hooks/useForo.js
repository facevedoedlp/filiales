import { useQuery } from '@tanstack/react-query';
import api from '../api/client.js';

const FORO_QUERY_KEY = ['foro'];

export const useTemasForo = () => {
  return useQuery({
    queryKey: FORO_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get('/foro');
      return data.data;
    },
  });
};

export default useTemasForo;
