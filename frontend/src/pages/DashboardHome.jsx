import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { invoiceApi } from '../services/api/invoiceApi';
import { dashboardApi } from '../services/api/dashboardApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import dayjs from 'dayjs';

const StatCard = ({ title, value, icon, trend }) => (
    <Card padding="p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 font-semibold text-sm tracking-tight">{title}</h3>
            <div className="text-slate-400">{icon}</div>
        </div>
        <div className="flex items-end gap-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value}</h2>
            {trend && <span className="text-xs font-semibold text-emerald-500 mb-0.5">{trend}</span>}
        </div>
    </Card>
);

const DashboardHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        paid: 0,
        pending: 0,
        overdueCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [metricsData, invoiceData] = await Promise.all([
                    dashboardApi.getMetrics(),
                    invoiceApi.getAll()
                ]);
                
                setInvoices(invoiceData.slice(0, 5)); // Keep latest 5 for feed
                
                // Overlay pure DB computed logic explicitly
                setStats({ 
                    totalRevenue: metricsData.totalRevenue || 0, 
                    paid: metricsData.currentMonthRevenue || 0, 
                    pending: metricsData.pendingAmount || 0, 
                    overdueCount: metricsData.overdueInvoicesCount || 0,
                    trend: metricsData.percentageChange > 0 ? `+${metricsData.percentageChange.toFixed(1)}%` : (metricsData.percentageChange < 0 ? `${metricsData.percentageChange.toFixed(1)}%` : null)
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="w-48 h-8 bg-slate-200 animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse border border-slate-100" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header & Quick Actions */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Overview</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Here's what's happening with your business today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/invoices">
                        <Button variant="secondary" className="shadow-none tracking-tight">View All Invoices</Button>
                    </Link>
                    <Link to="/invoices/new">
                        <Button variant="primary" className="shadow-none bg-brand-base hover:bg-brand-hover tracking-tight">
                            <Plus size={16} className="mr-2" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp size={20} />} trend={stats.trend} />
                <StatCard title="Pending Amount" value={formatCurrency(stats.pending)} icon={<Clock size={20} />} />
                <StatCard title="Overdue Invoices" value={stats.overdueCount} icon={<AlertTriangle size={20} className={stats.overdueCount > 0 ? "text-red-500" : ""} />} />
            </div>

            {/* Recent Invoices Table */}
            <Card padding="p-0 overflow-hidden border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Invoices</h3>
                    <Link to="/invoices" className="text-sm font-semibold text-brand-base hover:text-brand-hover flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                
                {invoices.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center bg-white">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                            <FileText size={20} className="text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No invoices yet</h3>
                        <p className="text-xs text-slate-500 mb-5">Create your first invoice to track your revenue.</p>
                        <Link to="/invoices/new">
                            <Button variant="primary" size="sm" className="shadow-sm">Create Invoice</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="px-6 py-3">Invoice ID</th>
                                    <th className="px-6 py-3">Client</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 hidden sm:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/invoices/edit/${inv._id}`)}>
                                        <td className="px-6 py-4 font-semibold text-slate-900 tracking-tight">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-slate-600">{inv.client.name || 'Unnamed Client'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{inv.currency} {inv.totalAmount?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <Badge status={inv.isDraft ? 'draft' : inv.status} />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 hidden sm:table-cell font-medium">{dayjs(inv.issueDate).format('MMM D, YYYY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DashboardHome;
