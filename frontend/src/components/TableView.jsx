import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Card from './ui/Card';
import Badge from './ui/Badge';

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const PAGE_SIZE = 25;

const computeOverdue = (inv) => !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-slate-900" /> : <ChevronDown size={12} className="text-slate-900" />;
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
        <th className={`px-4 py-3 cursor-pointer select-none border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 ${right ? 'text-right' : 'text-left'}`} onClick={() => handleSort(field)}>
            <span className={`flex items-center gap-1 ${right ? 'justify-end' : ''}`}>
                {label}
                <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
            </span>
        </th>
    );

    return (
        <div>
            <div className="flex items-center gap-3 mb-4 px-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    <input type="checkbox" className="rounded border-slate-300 text-brand-base focus:ring-brand-base" checked={overdueOnly} onChange={e => { setOverdueOnly(e.target.checked); setPage(1); }} />
                    <AlertTriangle size={13} className="text-red-400" /> Overdue only
                </label>
                <span className="text-xs text-slate-400 font-medium">{processed.length} invoice{processed.length !== 1 ? 's' : ''}</span>
            </div>

            <Card padding="p-0 overflow-hidden">
                <div className="overflow-x-auto bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
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
                                    let effStatus = inv.status?.toLowerCase() || 'draft';
                                    if (inv.isDraft) effStatus = 'draft';
                                    if (effStatus !== 'paid' && overdue) effStatus = 'overdue';

                                    return (
                                        <motion.tr
                                            key={inv._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="cursor-pointer hover:bg-slate-50 border-b last:border-0 border-slate-50 transition-colors"
                                            onClick={() => onRowClick(inv)}
                                        >
                                            <td className="px-4 py-3 font-semibold text-slate-900 tracking-tight text-xs">{inv.invoiceNumber}</td>
                                            <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">{inv.client?.name || '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge status={effStatus} />
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-900 text-right">{currSym(inv.currency)} {Number(inv.totalAmount).toFixed(2)}</td>
                                            <td className={`px-4 py-3 ${overdue ? 'text-red-500 font-semibold' : 'text-slate-500 font-medium'}`}>
                                                <span className="flex items-center gap-1.5 text-xs">
                                                    {overdue && <AlertTriangle size={11} />}
                                                    <Calendar size={11} className={overdue ? 'text-red-300' : 'text-slate-300'} />
                                                    {fmtDate(inv.dueDate)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs font-medium">{fmtDate(inv.createdAt)}</td>
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
            </Card>
        </div>
    );
};

export default TableView;
