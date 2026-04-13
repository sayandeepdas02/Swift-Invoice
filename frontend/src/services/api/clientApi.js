import api from '../../lib/api';

export const clientApi = {
    getAll: async () => {
        const { data } = await api.get('/api/clients');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    create: async (clientData) => {
        const { data } = await api.post('/api/clients', clientData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    update: async (id, clientData) => {
        const { data } = await api.put(`/api/clients/${id}`, clientData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    delete: async (id) => {
        const { data } = await api.delete(`/api/clients/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    getHistory: async (id) => {
        const { data } = await api.get(`/api/clients/${id}/history`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
