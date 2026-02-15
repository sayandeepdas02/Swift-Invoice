import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Search, Filter, AlertCircle, Calendar, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get('/invoices');
            setInvoices(data);
        } catch (error) {
            toast.error('Failed to fetch invoices');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (invoice) => {
        try {
            const response = await api.get(`/invoices/${invoice._id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `INV-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded successfully');
        } catch (error) {
            toast.error('Download failed');
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            await api.delete(`/invoices/${id}`);
            setInvoices(invoices.filter(inv => inv._id !== id));
            toast.success('Invoice deleted');
        } catch (error) {
            toast.error('Delete failed');
            console.error(error);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        // Optimistic update
        const originalInvoices = [...invoices];
        setInvoices(invoices.map(inv =>
            inv._id === id ? { ...inv, status: newStatus } : inv
        ));

        try {
            await api.patch(`/invoices/${id}/status`, { status: newStatus });
            toast.success('Status updated');
        } catch (error) {
            setInvoices(originalInvoices); // Rollback
            toast.error('Failed to update status');
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 italic uppercase">My Invoices</h1>
                        <p className="text-zinc-500">Manage and track your invoice history.</p>
                    </div>
                    <Link to="/dashboard" className="btn-primary flex items-center gap-2 px-6 py-3 shadow-xl shadow-primary-soft">
                        <FileText className="w-5 h-5" /> Create New
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            placeholder="Search by Invoice # or Client..."
                            className="input-field pl-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Filter className="w-5 h-5 text-zinc-400" />
                        {['all', 'pending', 'paid', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${statusFilter === status
                                    ? 'bg-black text-white shadow-lg'
                                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {filteredInvoices.length > 0 ? (
                    <div className="space-y-4">
                        {filteredInvoices.map((invoice) => (
                            <motion.div
                                key={invoice._id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6"
                            >
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-4 mb-1">
                                        <span className="text-lg font-black tracking-tight">#{invoice.invoiceNumber}</span>
                                        <select
                                            value={invoice.status}
                                            onChange={(e) => handleStatusChange(invoice._id, e.target.value)}
                                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border cursor-pointer outline-none appearance-none ${getStatusColor(invoice.status)}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="text-zinc-500 font-medium">{invoice.client.name}</div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Date</div>
                                        <div className="font-semibold text-zinc-700 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Amount</div>
                                        <div className="text-xl font-black">{invoice.currency} {invoice.totalAmount.toFixed(2)}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/dashboard?edit=${invoice._id}`)}
                                            className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                                            title="Edit Invoice"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(invoice)}
                                            className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(invoice._id)}
                                            className="p-3 bg-red-50 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                                            title="Delete Invoice"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-zinc-100 border-dashed">
                        <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-zinc-300" />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 mb-2">No invoices found</h3>
                        <p className="text-zinc-500 max-w-sm mx-auto mb-8">
                            {searchTerm || statusFilter !== 'all'
                                ? "Try adjusting your filters to see more results."
                                : "Create your first invoice to see it listed here."}
                        </p>
                        <Link to="/dashboard" className="btn-primary px-8 py-3">
                            Create Invoice
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceHistory;
