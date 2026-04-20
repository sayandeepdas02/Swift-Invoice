import Invoice from '../models/Invoice.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user.workspaceId;
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const metrics = await Invoice.aggregate([
            { $match: { userId } },
            { 
                $project: {
                    status: 1,
                    totalAmount: 1,
                    dueDate: 1,
                    createdAt: 1,
                    isPaid: { $cond: [{ $in: ['$status', ['paid', 'Paid']] }, 1, 0] },
                    isOverdue: { 
                        $cond: [
                            { $and: [
                                { $not: [{ $in: ['$status', ['paid', 'Paid']] }] },
                                { $lt: ['$dueDate', now] }
                            ]}, 
                            1, 0
                        ] 
                    },
                    isCurrentMonth: { $cond: [{ $gte: ['$createdAt', startOfCurrentMonth] }, 1, 0] },
                    isLastMonth: { 
                        $cond: [
                            { $and: [
                                { $gte: ['$createdAt', startOfLastMonth] },
                                { $lt: ['$createdAt', startOfCurrentMonth] }
                            ]}, 
                            1, 0
                        ] 
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    paidInvoicesCount: { $sum: '$isPaid' },
                    overdueInvoicesCount: { $sum: '$isOverdue' },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$isPaid', 1] }, '$totalAmount', 0] }
                    },
                    pendingAmount: {
                        $sum: { $cond: [{ $eq: ['$isPaid', 0] }, '$totalAmount', 0] }
                    },
                    overdueAmount: {
                        $sum: { $cond: [{ $eq: ['$isOverdue', 1] }, '$totalAmount', 0] }
                    },
                    currentMonthRevenue: {
                        $sum: { 
                            $cond: [
                                { $and: [{ $eq: ['$isPaid', 1] }, { $eq: ['$isCurrentMonth', 1] }] }, 
                                '$totalAmount', 0
                            ] 
                        }
                    },
                    lastMonthRevenue: {
                        $sum: { 
                            $cond: [
                                { $and: [{ $eq: ['$isPaid', 1] }, { $eq: ['$isLastMonth', 1] }] }, 
                                '$totalAmount', 0
                            ] 
                        }
                    }
                }
            }
        ]);

        const data = metrics[0] || {
            totalInvoices: 0,
            paidInvoicesCount: 0,
            overdueInvoicesCount: 0,
            totalRevenue: 0,
            pendingAmount: 0,
            overdueAmount: 0,
            currentMonthRevenue: 0,
            lastMonthRevenue: 0
        };

        const percentageChange = data.lastMonthRevenue === 0 
                                 ? (data.currentMonthRevenue > 0 ? 100 : 0) 
                                 : ((data.currentMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100;

        res.json({ success: true, data: { ...data, percentageChange } });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};

import mongoose from 'mongoose';
import { logger } from '../services/logger.js';

export const getAdvancedMetrics = async (req, res) => {
    try {
        // Need string to ObjectId transformation natively to properly pass aggregation boundaries
        const userId = new mongoose.Types.ObjectId(req.user.workspaceId);
        const range = req.query.range || '30d';
        let startDate = new Date();
        
        switch (range) {
            case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
            case '90d': startDate.setDate(startDate.getDate() - 90); break;
            case '30d': default: startDate.setDate(startDate.getDate() - 30); break;
        }

        const matchStage = { 
            userId: userId, 
            createdAt: { $gte: startDate } 
        };

        // Monthly Trends
        const trends = await Invoice.aggregate([
            { $match: matchStage },
            { 
                $group: { 
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    revenue: { $sum: { $cond: [{ $in: ['$status', ['paid', 'Paid']] }, '$totalAmount', 0] } },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Payment Behavior Array mapping 
        const behavior = await Invoice.aggregate([
            { $match: { ...matchStage, status: { $in: ['paid', 'Paid'] }, paidAt: { $exists: true, $type: "date" }, dueDate: { $exists: true, $type: "date" } } },
            { 
                $project: { 
                    delayMs: { $subtract: ["$paidAt", "$dueDate"] } 
                } 
            },
            {
                $group: {
                    _id: null,
                    avgDelayMs: { $avg: "$delayMs" },
                    onTimeCount: { $sum: { $cond: [{ $lte: ["$delayMs", 0] }, 1, 0] } },
                    total: { $sum: 1 }
                }
            }
        ]);

        // Client Intelligence
        const clients = await Invoice.aggregate([
            { $match: matchStage },
            { 
                $group: {
                    _id: "$client.email",
                    name: { $first: "$client.name" },
                    revenue: { $sum: { $cond: [{ $in: ['$status', ['paid', 'Paid']] }, '$totalAmount', 0] } },
                    overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                trends: trends || [],
                behavior: behavior[0] || { avgDelayMs: 0, onTimeCount: 0, total: 0 },
                topClients: clients || []
            }
        });
    } catch (error) {
        logger.error('advanced_analytics_failed', { error: error.message, userId: req.user.workspaceId });
        res.status(500).json({ success: false, message: 'Advanced aggregation failed natively' });
    }
};
