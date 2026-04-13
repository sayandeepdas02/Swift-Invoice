import Invoice from '../models/Invoice.js';

export const getDashboardMetrics = async (req, res) => {
    try {
        const userId = req.user._id;
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
