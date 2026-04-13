import api from '../../lib/api';

export const serviceApi = {
    getAll: async () => {
        const { data } = await api.get('/api/services');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    create: async (serviceData) => {
        const { data } = await api.post('/api/services', serviceData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    delete: async (id) => {
        const { data } = await api.delete(`/api/services/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
