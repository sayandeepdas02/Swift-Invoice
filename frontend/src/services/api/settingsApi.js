import api from '../../lib/api';

export const settingsApi = {
    get: async () => {
        const { data } = await api.get('/api/settings');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    update: async (settingsData) => {
        const { data } = await api.put('/api/settings', settingsData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
