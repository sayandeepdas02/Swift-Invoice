import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';

export const getClients = async (req, res) => {
    try {
        const workspaceId = new mongoose.Types.ObjectId(req.user.workspaceId);
        
        const clients = await Client.aggregate([
            { $match: { userId: workspaceId } },
            {
                $lookup: {
                    from: 'invoices',
                    let: { clientEmail: '$email' },
                    pipeline: [
                        { $match: { 
                            $expr: { 
                                $and: [
                                    { $eq: ["$userId", workspaceId] },
                                    { $eq: [{ $toLower: "$client.email" }, { $toLower: "$$clientEmail" }] }
                                ]
                            } 
                        }}
                    ],
                    as: 'clientInvoices'
                }
            },
            {
                $addFields: {
                    totalInvoices: { $size: "$clientInvoices" },
                    totalRevenue: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$clientInvoices",
                                        as: "inv",
                                        cond: { $in: ["$$inv.status", ["paid", "Paid"]] }
                                    }
                                },
                                as: "paidInv",
                                in: { $ifNull: ["$$paidInv.totalAmount", 0] }
                            }
                        }
                    }
                }
            },
            { $project: { clientInvoices: 0 } },
            { $sort: { totalRevenue: -1, updatedAt: -1 } }
        ]);

        res.json({ success: true, data: clients, message: 'Clients fetched successfully' });
    } catch (error) {
        console.error('getClients pipeline error:', error);
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

export const createClient = async (req, res) => {
    try {
        const { name, email, phone, address, companyName } = req.body;
        if (!name || !email) {
            return res.status(400).json({ success: false, data: null, message: 'Name and email are required' });
        }

        const clientExists = await Client.findOne({ userId: req.user.workspaceId, email });
        if (clientExists) {
            return res.status(400).json({ success: false, data: null, message: 'Client with this email already exists' });
        }

        const client = await Client.create({
            userId: req.user.workspaceId,
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
            { _id: req.params.id, userId: req.user.workspaceId },
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
        const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user.workspaceId });
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
        const client = await Client.findOne({ _id: req.params.id, userId: req.user.workspaceId });
        if (!client) {
            return res.status(404).json({ success: false, data: null, message: 'Client not found' });
        }

        const invoices = await Invoice.find({ 
            userId: req.user.workspaceId, 
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
