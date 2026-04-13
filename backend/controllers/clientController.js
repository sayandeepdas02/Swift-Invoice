import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';

export const getClients = async (req, res) => {
    try {
        const clients = await Client.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.json({ success: true, data: clients, message: 'Clients fetched successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const createClient = async (req, res) => {
    try {
        const { name, email, phone, address, companyName } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, data: null, message: 'Name and email are required' });
        }

        const clientExists = await Client.findOne({ userId: req.user._id, email });
        if (clientExists) {
            return res.status(400).json({ success: false, data: null, message: 'Client with this email already exists' });
        }

        const client = await Client.create({
            userId: req.user._id,
            name,
            email,
            phone,
            address,
            companyName
        });

        res.status(201).json({ success: true, data: client, message: 'Client created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
};

export const updateClient = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!client) {
            return res.status(404).json({ success: false, data: null, message: 'Client not found' });
        }

        res.json({ success: true, data: client, message: 'Client updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, data: null, message: error.message });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!client) {
            return res.status(404).json({ success: false, data: null, message: 'Client not found' });
        }

        res.json({ success: true, data: null, message: 'Client removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const getClientHistory = async (req, res) => {
    try {
        const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
        if (!client) {
            return res.status(404).json({ success: false, data: null, message: 'Client not found' });
        }

        const invoices = await Invoice.find({ 
            userId: req.user._id, 
            'client.email': client.email 
        }).sort({ createdAt: -1 });

        let totalRevenue = 0;
        let pendingAmount = 0;
        let overdueAmount = 0;

        const now = new Date();

        invoices.forEach(inv => {
            if (inv.status === 'paid' || inv.status === 'Paid') {
                totalRevenue += inv.totalAmount || 0;
            } else {
                pendingAmount += inv.totalAmount || 0;
                if (inv.isOverdue || inv.status === 'overdue' || (inv.dueDate && new Date(inv.dueDate) < now)) {
                    overdueAmount += inv.totalAmount || 0;
                }
            }
        });

        res.json({
            success: true,
            data: {
                client,
                invoices,
                summary: {
                    totalRevenue,
                    pendingAmount,
                    overdueAmount,
                    invoiceCount: invoices.length
                }
            },
            message: 'Client history fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};
