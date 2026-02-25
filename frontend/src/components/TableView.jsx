import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, Calendar,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const PAGE_SIZE = 25;

const STATUS_STYLES = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-100 text-blue-600',
    viewed: 'bg-purple-100 text-purple-600',
    awaiting_payment: 'bg-orange-100 text-orange-600',
    paid: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-600',
};
const STATUS_LABELS = {
    draft: 'Draft', sent: 'Sent', viewed: 'Viewed', awaiting_payment: 'Awaiting',
    paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled',
};

const computeOverdue = (inv) =>
    !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ChevronsUpDown size={13} className="text-zinc-300" />;
    return sortDir === 'asc'
        ? <ChevronUp size={13} className="text-zinc-700" />
        : <ChevronDown size={13} className="text-zinc-700" />;
};

const TableView = ({ invoices, searchTerm, statusFilter, onRowClick }) => {
    const [sortField, setSortField] = useState('updatedAt');
    const [sortDir, setSortDir] = useState('desc');
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [page, setPage] = useState(1);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
        setPage(1);
    };

    const processed = useMemo(() => {
        let result = invoices.filter(inv => {
            const term = searchTerm?.toLowerCase() || '';
            const matchSearch = !term
                || inv.invoiceNumber?.toLowerCase().includes(term)
                || inv.client?.name?.toLowerCase().includes(term);
            const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
            const matchOverdue = !overdueOnly || computeOverdue(inv);
            return matchSearch && matchStatus && matchOverdue;
        });

        result.sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            if (sortField === 'client') { va = a.client?.name; vb = b.client?.name; }
            if (sortField === 'totalAmount') { va = Number(va); vb = Number(vb); }
            if (va == null) return 1;
            if (vb == null) return -1;
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            const cmp = va < vb ? -1 : va > vb ? 1 : 0;
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [invoices, searchTerm, statusFilter, overdueOnly, sortField, sortDir]);

    const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const paginated = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const fmtDate = (d) => {
        try { return d ? format(new Date(d), 'dd MMM yy') : '—'; }
        catch { return '—'; }
    };

    const ColHeader = ({ label, field }) => (
        <th
            className="table-th cursor-pointer select-none"
            onClick={() => handleSort(field)}
        >
            <span className="flex items-center gap-1">
                {label}
                <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
            </span>
        </th>
    );

    return (
        <div>
            {/* Overdue filter toggle */}
            <div className="flex items-center gap-3 mb-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors">
                    <input
                        type="checkbox"
                        className="rounded border-zinc-300 text-primary focus:ring-primary"
                        checked={overdueOnly}
                        onChange={e => { setOverdueOnly(e.target.checked); setPage(1); }}
                    />
                    <AlertTriangle size={13} className="text-red-400" />
                    Overdue only
                </label>
                <span className="text-xs text-zinc-400">{processed.length} invoice{processed.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Table */}
            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/60">
                                <ColHeader label="Invoice #" field="invoiceNumber" />
                                <ColHeader label="Client" field="client" />
                                <ColHeader label="Status" field="status" />
                                <ColHeader label="Amount" field="totalAmount" />
                                <ColHeader label="Due Date" field="dueDate" />
                                <ColHeader label="Created" field="createdAt" />
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-zinc-400 text-sm font-medium">
                                        No invoices match your filters
                                    </td>
                                </tr>
                            ) : (
                                paginated.map(inv => {
                                    const overdue = computeOverdue(inv);
                                    const statusCls = STATUS_STYLES[inv.status] || 'bg-zinc-100 text-zinc-500';
                                    const statusLabel = STATUS_LABELS[inv.status] || inv.status;
                                    return (
                                        <motion.tr
                                            key={inv._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="table-row group"
                                            onClick={() => onRowClick(inv)}
                                        >
                                            <td className="table-td font-black text-zinc-800 tracking-tight">
                                                #{inv.invoiceNumber}
                                            </td>
                                            <td className="table-td font-semibold text-zinc-700">
                                                {inv.client?.name || '—'}
                                            </td>
                                            <td className="table-td">
                                                <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${statusCls}`}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td className="table-td font-bold text-zinc-900">
                                                {currSym(inv.currency)}{Number(inv.totalAmount).toFixed(2)}
                                            </td>
                                            <td className={`table-td ${overdue ? 'text-red-500 font-bold' : 'text-zinc-500'}`}>
                                                <span className="flex items-center gap-1.5">
                                                    {overdue && <AlertTriangle size={11} />}
                                                    <Calendar size={11} className="text-zinc-300" />
                                                    {fmtDate(inv.dueDate)}
                                                </span>
                                            </td>
                                            <td className="table-td text-zinc-400">
                                                {fmtDate(inv.createdAt)}
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
                        <span className="text-xs text-zinc-400 font-medium">
                            Page {page} of {totalPages} · {processed.length} total
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pg = i + 1;
                                if (totalPages > 5) {
                                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                                    pg = start + i;
                                }
                                return (
                                    <button
                                        key={pg}
                                        onClick={() => setPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${pg === page ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-500'}`}
                                    >
                                        {pg}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableView;
