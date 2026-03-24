import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Filter, LayoutGrid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';
import TableView from '../components/TableView';
import InvoiceDrawer from '../components/InvoiceDrawer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const STATUS_FILTERS = ['all', 'draft', 'sent', 'viewed', 'awaiting_payment', 'paid'];
const STATUS_LABELS = {
    all: 'All', draft: 'Draft', sent: 'Sent', viewed: 'Viewed',
    awaiting_payment: 'Awaiting', paid: 'Paid',
};

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban'); // 'kanban' | 'table'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const fetchInvoices = useCallback(async () => {
        try {
            const { data } = await api.get('/invoices');
            setInvoices(data);
        } catch {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

    const handleStatusChange = async (invoiceId, newStatus, rollbackStatus) => {
        setInvoices(prev => prev.map(inv => inv._id === invoiceId ? { ...inv, status: newStatus } : inv));
        try {
            const { data } = await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
            setInvoices(prev => prev.map(inv => inv._id === invoiceId ? data : inv));
        } catch {
            setInvoices(prev => prev.map(inv => inv._id === invoiceId ? { ...inv, status: rollbackStatus } : inv));
            toast.error('Failed to update status');
        }
    };

    const handleInvoiceUpdate = (updated) => {
        setInvoices(prev => prev.map(inv => inv._id === updated._id ? updated : inv));
        setSelectedInvoice(updated);
    };

    const handleInvoiceDelete = (id) => {
        setInvoices(prev => prev.filter(inv => inv._id !== id));
        setSelectedInvoice(null);
    };

    const handleDuplicate = (newInvoice) => {
        setInvoices(prev => [newInvoice, ...prev]);
    };

    const handleCardClick = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const filteredForTable = invoices.filter(inv => {
        const term = searchTerm.toLowerCase();
        const matchSearch = !term
            || inv.invoiceNumber?.toLowerCase().includes(term)
            || inv.client?.name?.toLowerCase().includes(term);
        const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex justify-center items-center bg-bg-base">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-text-primary border-r-2 border-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-base pt-20 pb-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-6 mt-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-1">My Invoices</h1>
                        <p className="text-text-secondary text-sm">Manage and track your invoice lifecycle.</p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* View Toggle */}
                        <div className="flex items-center bg-transparent border border-border-base rounded p-1 shadow-sm h-[36px]">
                            <button
                                onClick={() => setView('kanban')}
                                className={`flex items-center gap-1.5 px-3 h-full rounded text-xs font-semibold transition-colors ${view === 'kanban' ? 'bg-white text-text-primary shadow-sm border border-border-base' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <LayoutGrid size={14} /> Kanban
                            </button>
                            <button
                                onClick={() => setView('table')}
                                className={`flex items-center gap-1.5 px-3 h-full rounded text-xs font-semibold transition-colors ${view === 'table' ? 'bg-white text-text-primary shadow-sm border border-border-base' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                <List size={14} /> Table
                            </button>
                        </div>

                        <Link to="/dashboard">
                            <Button variant="primary" className="h-[36px] px-4 py-0 text-sm shadow-none">
                                <Plus className="w-4 h-4 mr-2" /> Create New
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border-base pb-4 sticky top-[64px] z-10 bg-bg-base">
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search invoice # or client name…"
                            className="input-field pl-9 h-[36px] bg-white text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <div className="hidden md:flex items-center text-text-secondary mr-2">
                            <Filter className="w-4 h-4 mr-1.5" />
                            <span className="text-xs uppercase font-semibold tracking-wider">Filter:</span>
                        </div>
                        {STATUS_FILTERS.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded text-xs font-semibold capitalize transition-colors whitespace-nowrap border ${statusFilter === s ? 'bg-white border-border-base text-text-primary shadow-sm' : 'bg-transparent text-text-secondary border-transparent hover:bg-slate-100 flex-shrink-0'}`}
                            >
                                {STATUS_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main View */}
                <div className="min-h-[60vh]">
                    {view === 'kanban' ? (
                        <KanbanBoard
                            invoices={invoices}
                            onStatusChange={handleStatusChange}
                            onCardClick={handleCardClick}
                        />
                    ) : (
                        <TableView
                            invoices={filteredForTable}
                            searchTerm={searchTerm}
                            statusFilter={statusFilter}
                            onRowClick={handleCardClick}
                        />
                    )}
                </div>
            </div>

            {selectedInvoice && (
                <InvoiceDrawer
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                    onUpdate={handleInvoiceUpdate}
                    onDelete={handleInvoiceDelete}
                    onDuplicate={handleDuplicate}
                />
            )}
        </div>
    );
};

export default InvoiceHistory;
