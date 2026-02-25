import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard';
import TableView from '../components/TableView';
import InvoiceDrawer from '../components/InvoiceDrawer';

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

    // ── Data fetch ─────────────────────────────────────────────────
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

    // ── Status update (used by Kanban drag-and-drop) ────────────────
    const handleStatusChange = async (invoiceId, newStatus, rollbackStatus) => {
        // Optimistic update
        setInvoices(prev =>
            prev.map(inv => inv._id === invoiceId ? { ...inv, status: newStatus } : inv)
        );

        try {
            const { data } = await api.patch(`/invoices/${invoiceId}/status`, { status: newStatus });
            // Sync with server response (includes lifecycle timestamps + isOverdue)
            setInvoices(prev => prev.map(inv => inv._id === invoiceId ? data : inv));
        } catch {
            // Rollback
            setInvoices(prev =>
                prev.map(inv => inv._id === invoiceId ? { ...inv, status: rollbackStatus } : inv)
            );
            toast.error('Failed to update status');
        }
    };

    // ── Drawer callbacks ────────────────────────────────────────────
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

    // ── Filtered invoices (for table view) ─────────────────────────
    // Kanban handles its own grouping internally; table uses these filters
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
            <div className="min-h-screen pt-32 pb-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pt-28 pb-20">
            <div className="max-w-[1600px] mx-auto px-6">

                {/* ── Page Header ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight italic uppercase mb-1">My Invoices</h1>
                        <p className="text-zinc-500">Manage and track your invoice lifecycle.</p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* View Toggle */}
                        <div className="flex items-center bg-zinc-100 rounded-2xl p-1">
                            <button
                                onClick={() => setView('kanban')}
                                className={`view-toggle-btn ${view === 'kanban' ? 'view-toggle-active' : ''}`}
                            >
                                <LayoutGrid size={14} /> Kanban
                            </button>
                            <button
                                onClick={() => setView('table')}
                                className={`view-toggle-btn ${view === 'table' ? 'view-toggle-active' : ''}`}
                            >
                                <List size={14} /> Table
                            </button>
                        </div>

                        <Link to="/dashboard" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm shadow-lg shadow-primary-soft">
                            <FileText size={15} /> Create New
                        </Link>
                    </div>
                </div>

                {/* ── Filters (shared) ─────────────────────────── */}
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-zinc-100 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            placeholder="Search invoice # or client…"
                            className="input-field pl-11 py-2.5 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Filter className="w-4 h-4 text-zinc-400 mr-1" />
                        {STATUS_FILTERS.map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-black text-white shadow' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                            >
                                {STATUS_LABELS[s]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Main View ────────────────────────────────── */}
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

            {/* ── Detail Drawer ────────────────────────────────── */}
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
