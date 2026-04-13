import api from '../../lib/api';

export const invoiceApi = {
    getAll: async () => {
        const { data } = await api.get('/api/invoices');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },
    
    getLast: async () => {
        const { data } = await api.get('/api/invoices/last');
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getById: async (id) => {
        const { data } = await api.get(`/api/invoices/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    getPublic: async (publicId) => {
        const { data } = await api.get(`/api/public/invoice/${publicId}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    create: async (invoiceData) => {
        const { data } = await api.post('/api/invoices', invoiceData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    update: async (id, invoiceData) => {
        const { data } = await api.put(`/api/invoices/${id}`, invoiceData);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    delete: async (id) => {
        const { data } = await api.delete(`/api/invoices/${id}`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    updateStatus: async (id, status) => {
        const { data } = await api.patch(`/api/invoices/${id}/status`, { status });
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    duplicate: async (id) => {
        const { data } = await api.post(`/api/invoices/${id}/duplicate`);
        if (!data.success) throw new Error(data.message);
        return data.data;
    },

    downloadPdf: async (id) => {
        // PDF download isn't JSON wrapped, standard Blob response
        const response = await api.get(`/api/invoices/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    send: async (id, messagePayload) => {
        const { data } = await api.post(`/api/invoices/${id}/send`, messagePayload);
        if (!data.success) throw new Error(data.message);
        return data.data;
    }
};
