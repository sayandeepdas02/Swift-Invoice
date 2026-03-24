import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, LayoutGrid, List, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';
import TableView from '../components/TableView';
import InvoiceDrawer from '../components/InvoiceDrawer';
import Button from '../components/ui/Button';

// Added specific filters requested: All, Paid, Pending, Overdue, Draft
const STATUS_FILTERS = ['all', 'paid', 'pending', 'overdue', 'draft'];
const STATUS_LABELS = {
    all: 'All', paid: 'Paid', pending: 'Pending', overdue: 'Overdue', draft: 'Draft'
};

const InvoicesList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('table'); // 'kanban' | 'table'
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

    const isOverdue = (inv) => !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

    // Filter logic handling "overdue" as a virtual status
    const filteredForTable = invoices.filter(inv => {
        const term = searchTerm.toLowerCase();
        const matchSearch = !term
            || inv.invoiceNumber?.toLowerCase().includes(term)
            || inv.client?.name?.toLowerCase().includes(term);
        
        // Handle virtual status
        let effStatus = inv.status?.toLowerCase();
        if (inv.isDraft) effStatus = 'draft';
        if (effStatus !== 'paid' && isOverdue(inv)) effStatus = 'overdue';
        
        const matchStatus = statusFilter === 'all' || effStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="w-48 h-8 bg-slate-200 animate-pulse mb-8" />
                <div className="h-96 bg-slate-200 animate-pulse border border-slate-100" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Invoices</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight">Manage and track your invoice lifecycle.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 border border-slate-200">
                        <button
                            onClick={() => setView('table')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-tight transition-colors ${view === 'table' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 border border-transparent'}`}
                        >
                            <List size={14} /> Table
                        </button>
                        <button
                            onClick={() => setView('kanban')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-tight transition-colors ${view === 'kanban' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 border border-transparent'}`}
                        >
                            <LayoutGrid size={14} /> Kanban
                        </button>
                    </div>

                    <Link to="/invoices/new">
                        <Button variant="primary" className="py-2 text-sm shadow-none bg-brand-base hover:bg-brand-hover rounded-none tracking-tight border-none">
                            <Plus className="w-4 h-4 mr-2" /> Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-4">
                <div className="relative w-full md:w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        placeholder="Search invoices..."
                        className="w-full pl-9 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base rounded-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {STATUS_FILTERS.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap border ${statusFilter === s ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100'}`}
                        >
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main View Data */}
            <div className="min-h-[60vh]">
                {view === 'kanban' ? (
                    <KanbanBoard
                        invoices={filteredForTable}
                        onStatusChange={handleStatusChange}
                        onCardClick={(inv) => setSelectedInvoice(inv)}
                    />
                ) : (
                    <TableView
                        invoices={filteredForTable}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        onRowClick={(inv) => setSelectedInvoice(inv)}
                    />
                )}
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

export default InvoicesList;
