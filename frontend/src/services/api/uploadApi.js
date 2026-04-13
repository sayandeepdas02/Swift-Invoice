import api from '../../lib/api';

export const uploadApi = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const { data } = await api.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!data.success) throw new Error(data.message);
        return data.url;
    }
};
