import api from '../../lib/api';

export const invoiceApi = {
    getAll: async () => {
        const { data } = await api.get('/invoices');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    
    getById: async (id) => {
        const { data } = await api.get(`/invoices/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    create: async (invoiceData) => {
        const { data } = await api.post('/invoices', invoiceData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    update: async (id, invoiceData) => {
        const { data } = await api.put(`/invoices/${id}`, invoiceData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/invoices/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateStatus: async (id, status) => {
        const { data } = await api.patch(`/invoices/${id}/status`, { status });
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    duplicate: async (id) => {
        const { data } = await api.post(`/invoices/${id}/duplicate`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    downloadPdf: async (id) => {
        // PDF download isn't JSON wrapped, standard Blob response
        const response = await api.get(`/invoices/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
