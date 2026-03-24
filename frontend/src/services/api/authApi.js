import api from '../../lib/api';

export const authApi = {
    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    register: async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    logout: async () => {
        const { data } = await api.post('/auth/logout');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getMe: async () => {
        const { data } = await api.get('/auth/me');
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
