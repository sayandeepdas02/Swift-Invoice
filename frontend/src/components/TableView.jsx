import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const PAGE_SIZE = 25;

const STATUS_STYLES = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-blue-50 text-blue-600',
    viewed: 'bg-purple-50 text-purple-600',
    awaiting_payment: 'bg-orange-50 text-orange-600',
    paid: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
};
const STATUS_LABELS = {
    draft: 'Draft', sent: 'Sent', viewed: 'Viewed', awaiting_payment: 'Awaiting',
    paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled',
};

const computeOverdue = (inv) => !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-text-primary" /> : <ChevronDown size={12} className="text-text-primary" />;
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
            const matchSearch = !term || inv.invoiceNumber?.toLowerCase().includes(term) || inv.client?.name?.toLowerCase().includes(term);
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

    const ColHeader = ({ label, field, right = false }) => (
        <th className={`table-th cursor-pointer select-none border-t-0 p-3 bg-slate-50 ${right ? 'text-right' : 'text-left'}`} onClick={() => handleSort(field)}>
            <span className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
                {label}
                <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
            </span>
        </th>
    );

    return (
        <div>
            <div className="flex items-center gap-3 mb-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-500 hover:text-text-primary transition-colors">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-base focus:ring-brand-base" checked={overdueOnly} onChange={e => { setOverdueOnly(e.target.checked); setPage(1); }} />
                    <AlertTriangle size={13} className="text-red-400" /> Overdue only
                </label>
                <span className="text-xs text-slate-400 font-medium">{processed.length} invoice{processed.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="bg-white border border-border-base rounded-md overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border-base">
                                <ColHeader label="Invoice #" field="invoiceNumber" />
                                <ColHeader label="Client" field="client" />
                                <ColHeader label="Status" field="status" />
                                <ColHeader label="Amount" field="totalAmount" right />
                                <ColHeader label="Due Date" field="dueDate" />
                                <ColHeader label="Created" field="createdAt" />
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-400 text-sm font-medium">No invoices match your filters</td></tr>
                            ) : (
                                paginated.map(inv => {
                                    const overdue = computeOverdue(inv);
                                    const statusCls = STATUS_STYLES[inv.status] || 'bg-slate-100 text-slate-500';
                                    const statusLabel = STATUS_LABELS[inv.status] || inv.status;
                                    return (
                                        <motion.tr
                                            key={inv._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="table-row cursor-pointer hover:bg-slate-50 border-b last:border-0 border-border-base transition-colors"
                                            onClick={() => onRowClick(inv)}
                                        >
                                            <td className="p-3 font-semibold text-text-primary uppercase tracking-wider text-xs">#{inv.invoiceNumber}</td>
                                            <td className="p-3 font-medium text-text-primary">{inv.client?.name || '—'}</td>
                                            <td className="p-3">
                                                <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${statusCls}`}>{statusLabel}</span>
                                            </td>
                                            <td className="p-3 font-semibold text-text-primary text-right">{currSym(inv.currency)}{Number(inv.totalAmount).toFixed(2)}</td>
                                            <td className={`p-3 ${overdue ? 'text-red-500 font-semibold' : 'text-text-secondary'}`}>
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    {overdue && <AlertTriangle size={11} />}
                                                    <Calendar size={11} className={overdue ? 'text-red-300' : 'text-slate-300'} />
                                                    {fmtDate(inv.dueDate)}
                                                </span>
                                            </td>
                                            <td className="p-3 text-text-secondary text-xs">{fmtDate(inv.createdAt)}</td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border-base bg-slate-50">
                        <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronLeft size={16} /></button>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableView;
