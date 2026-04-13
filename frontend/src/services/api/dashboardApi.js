import api from '../../lib/api';

export const dashboardApi = {
    getMetrics: async () => {
        const { data } = await api.get('/api/dashboard/metrics');
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
