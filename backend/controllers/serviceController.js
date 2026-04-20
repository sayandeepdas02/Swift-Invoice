import ServiceItem from '../models/ServiceItem.js';

export const getServices = async (req, res) => {
    try {
        const services = await ServiceItem.find({ userId: req.user.workspaceId }).sort({ name: 1 });
        res.json({ success: true, data: services, message: 'Services fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const createService = async (req, res) => {
    try {
        const { name, description, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ success: false, data: null, message: 'Name and price are required' });
        }

        const serviceExists = await ServiceItem.findOne({ userId: req.user.workspaceId, name });
        if (serviceExists) {
            return res.status(400).json({ success: false, data: null, message: 'Service with this name already exists' });
        }

        const service = await ServiceItem.create({
            userId: req.user.workspaceId,
            name,
            description,
            price
        });

        res.status(201).json({ success: true, data: service, message: 'Service created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await ServiceItem.findOneAndDelete({ _id: req.params.id, userId: req.user.workspaceId });
        if (!service) {
            return res.status(404).json({ success: false, data: null, message: 'Service not found' });
        }
        res.json({ success: true, data: null, message: 'Service removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};
