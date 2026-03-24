import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';
import { invoiceApi } from '../services/api/invoiceApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import dayjs from 'dayjs';

const StatCard = ({ title, value, icon, trend }) => (
    <div className="bg-white p-6 border border-slate-200">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 font-semibold text-sm tracking-tight">{title}</h3>
            <div className="text-slate-400">{icon}</div>
        </div>
        <div className="flex items-end gap-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h2>
            {trend && <span className="text-xs font-semibold text-emerald-500 mb-1">{trend}</span>}
        </div>
    </div>
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
                const data = await invoiceApi.getAll();
                setInvoices(data.slice(0, 5)); // Get 5 most recent

                // Calculate simple stats
                let rev = 0;
                let pd = 0;
                let pend = 0;
                let over = 0;

                const today = dayjs();

                data.forEach(inv => {
                    const amount = inv.totalAmount || 0;
                    if (inv.status === 'Paid' || inv.status === 'paid') {
                        pd += amount;
                        rev += amount; // Assuming paid is realized revenue
                    } else if (inv.status === 'Pending' || inv.status === 'sent' || inv.status === 'viewed') {
                        pend += amount;
                        if (inv.dueDate && dayjs(inv.dueDate).isBefore(today)) {
                            over += 1;
                        }
                    } else if (inv.isOverdue || inv.status === 'overdue') {
                        pend += amount;
                        over += 1;
                    }
                });

                setStats({ totalRevenue: rev, paid: pd, pending: pend, overdueCount: over });
            } catch (error) {
                console.error("Failed to load dashboard data");
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp size={20} />} trend="+12.5%" />
                <StatCard title="Paid" value={formatCurrency(stats.paid)} icon={<CheckCircle2 size={20} />} />
                <StatCard title="Pending" value={formatCurrency(stats.pending)} icon={<Clock size={20} />} />
                <StatCard title="Overdue Invoices" value={stats.overdueCount} icon={<AlertTriangle size={20} className={stats.overdueCount > 0 ? "text-red-500" : ""} />} />
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white border border-slate-200">
                <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Invoices</h3>
                    <Link to="/invoices" className="text-sm font-semibold text-brand-base hover:text-brand-hover flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                
                {invoices.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <FileText size={20} className="text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No invoices yet</h3>
                        <p className="text-xs text-slate-500 mb-4">Create your first invoice to track your revenue.</p>
                        <Link to="/invoices/new">
                            <Button variant="secondary" size="sm" className="shadow-none">Create Invoice</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="px-6 py-3 font-semibold">Invoice ID</th>
                                    <th className="px-6 py-3 font-semibold">Client</th>
                                    <th className="px-6 py-3 font-semibold">Amount</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {invoices.map((inv) => (
                                    <tr key={inv._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/invoices/edit/${inv._id}`)}>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-slate-600">{inv.client.name || 'Unnamed Client'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{inv.currency} {inv.totalAmount?.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider border ${
                                                inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                inv.isDraft ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                                {inv.isDraft ? 'Draft' : inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">{dayjs(inv.issueDate).format('MMM D, YYYY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardHome;
