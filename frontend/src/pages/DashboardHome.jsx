import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, Clock, AlertTriangle, FileText } from 'lucide-react';
import { invoiceApi } from '../services/api/invoiceApi';
import { dashboardApi } from '../services/api/dashboardApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import dayjs from 'dayjs';

const StatCard = ({ title, value, icon, trend }) => (
    <Card padding="p-6 h-full flex flex-col justify-between border-line">
        <div className="flex justify-between items-start mb-6">
            <h3 className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest font-heading">{title}</h3>
            <div className="text-muted-foreground/40">{icon}</div>
        </div>
        <div className="flex items-end gap-3">
            <h2 className="text-3xl font-bold text-foreground tracking-tighter leading-none font-heading">{value}</h2>
            {trend && <span className="text-xs font-bold text-emerald-500 mb-1 tracking-tight">{trend}</span>}
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
                
                setInvoices(invoiceData.slice(0, 5));
                
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
            <div className="p-8 lg:p-12 space-y-8 max-w-[1600px] mx-auto">
                <div className="w-48 h-8 bg-muted animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse border border-line" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header & Quick Actions */}
            <div className="flex items-end justify-between border-b pb-8" style={{ borderColor: 'var(--color-line)' }}>
                <div>
                    <h1 className="text-4xl font-bold text-foreground tracking-tighter mb-2 font-heading">Overview</h1>
                    <p className="text-base text-muted-foreground font-medium tracking-tight">Here's what's happening with your business today.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/invoices">
                        <Button variant="outline" className="h-11 px-6 font-semibold">View All Invoices</Button>
                    </Link>
                    <Link to="/invoices/new">
                        <Button variant="brand" className="h-11 px-6 font-bold flex items-center gap-2">
                            <Plus size={18} strokeWidth={3} />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp size={20} />} trend={stats.trend} />
                <StatCard title="Pending Amount" value={formatCurrency(stats.pending)} icon={<Clock size={20} />} />
                <StatCard title="Overdue Invoices" value={stats.overdueCount} icon={<AlertTriangle size={20} className={stats.overdueCount > 0 ? "text-brand" : ""} />} />
            </div>

            {/* Recent Invoices Table */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h3 className="text-xl font-bold text-foreground tracking-tighter font-heading">Recent Invoices</h3>
                    <Link to="/invoices" className="text-sm font-bold text-brand hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                        View all <ArrowRight size={14} strokeWidth={3} />
                    </Link>
                </div>
                
                <Card padding="p-0 overflow-hidden">
                    {invoices.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-muted rounded-sm flex items-center justify-center mb-6">
                                <FileText size={24} className="text-muted-foreground/40" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2 font-heading tracking-tight">No invoices yet</h3>
                            <p className="text-sm text-muted-foreground mb-8 max-w-xs">Start your business journey by creating your first professional invoice.</p>
                            <Link to="/invoices/new">
                                <Button variant="brand" size="lg" className="px-10">Create First Invoice</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground" style={{ borderColor: 'var(--color-line)' }}>
                                        <th className="px-6 py-4">Invoice ID</th>
                                        <th className="px-6 py-4">Client</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 hidden sm:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {invoices.map((inv) => (
                                        <tr key={inv._id} className="border-b last:border-0 hover:bg-muted/20 transition-colors group cursor-pointer" 
                                            style={{ borderColor: 'var(--color-line)' }}
                                            onClick={() => navigate(`/invoices/edit/${inv._id}`)}>
                                            <td className="px-6 py-5 font-bold text-foreground tracking-tight font-heading">{inv.invoiceNumber}</td>
                                            <td className="px-6 py-5 text-foreground/80 font-medium">{inv.client.name || 'Unnamed Client'}</td>
                                            <td className="px-6 py-5 font-bold text-foreground text-base tracking-tighter font-heading">{inv.currency} {inv.totalAmount?.toFixed(2)}</td>
                                            <td className="px-6 py-5">
                                                <Badge status={inv.isDraft ? 'draft' : inv.status} />
                                            </td>
                                            <td className="px-6 py-5 text-muted-foreground hidden sm:table-cell font-medium">{dayjs(inv.issueDate).format('MMM D, YYYY')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DashboardHome;
