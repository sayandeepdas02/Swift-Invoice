import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Download, CheckCircle, Copy, Trash2, ExternalLink,
    Calendar, Clock, AlertTriangle, Send, User, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const STATUS_STYLES = {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
    sent: { label: 'Sent', cls: 'bg-blue-100 text-blue-600' },
    viewed: { label: 'Viewed', cls: 'bg-purple-100 text-purple-600' },
    awaiting_payment: { label: 'Awaiting Payment', cls: 'bg-orange-100 text-orange-600' },
    paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600' },
};

const computeOverdue = (inv) =>
    !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const InvoiceDrawer = ({ invoice, onClose, onUpdate, onDelete, onDuplicate, onDownload }) => {
    const drawerRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Close on overlay click
    const handleOverlayClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };

    if (!invoice) return null;

    const sym = currSym(invoice.currency);
    const isOverdue = computeOverdue(invoice);
    const status = STATUS_STYLES[invoice.status] || { label: invoice.status, cls: 'bg-zinc-100 text-zinc-600' };

    const handleMarkPaid = async () => {
        try {
            const { data } = await api.patch(`/invoices/${invoice._id}/status`, { status: 'paid' });
            toast.success('Marked as paid');
            onUpdate(data);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDuplicate = async () => {
        try {
            const { data } = await api.post(`/invoices/${invoice._id}/duplicate`);
            toast.success('Invoice duplicated as draft');
            onDuplicate(data);
            onClose();
        } catch {
            toast.error('Failed to duplicate invoice');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete invoice #${invoice.invoiceNumber}? This cannot be undone.`)) return;
        try {
            await api.delete(`/invoices/${invoice._id}`);
            toast.success('Invoice deleted');
            onDelete(invoice._id);
            onClose();
        } catch {
            toast.error('Failed to delete invoice');
        }
    };

    const handleDownload = async () => {
        try {
            const resp = await api.get(`/invoices/${invoice._id}/download`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([resp.data]));
            const a = document.createElement('a');
            a.href = url; a.download = `INV-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast.success('Downloaded');
        } catch {
            toast.error('Download failed');
        }
    };

    const fmtDate = (d) => d ? format(new Date(d), 'dd MMM yyyy') : '—';

    return (
        <AnimatePresence>
            <div className="drawer-overlay" onClick={handleOverlayClick}>
                <motion.div
                    ref={drawerRef}
                    className="invoice-drawer"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Drawer Header ──────────────────────────── */}
                    <div className="drawer-header">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                                    #{invoice.invoiceNumber}
                                </span>
                                {isOverdue && (
                                    <span className="badge-overdue">
                                        <AlertTriangle size={9} /> Overdue
                                    </span>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${status.cls}`}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/dashboard?edit=${invoice._id}`}
                                className="p-2 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
                                title="Edit invoice"
                            >
                                <ExternalLink size={16} />
                            </a>
                            <button onClick={onClose} className="p-2 rounded-xl text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── Drawer Body (scrollable) ───────────────── */}
                    <div className="drawer-body">
                        {/* Amount Block */}
                        <div className="drawer-amount-block">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-4xl font-black tracking-tight">
                                {sym}{Number(invoice.totalAmount).toFixed(2)}
                                <span className="text-sm font-bold text-zinc-400 ml-2">{invoice.currency}</span>
                            </p>
                        </div>

                        {/* Dates row */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="drawer-label">Issue Date</p>
                                <p className="drawer-value flex items-center gap-1"><Calendar size={12} /> {fmtDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="drawer-label">Due Date</p>
                                <p className={`drawer-value flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                    <Clock size={12} /> {fmtDate(invoice.dueDate)}
                                </p>
                            </div>
                        </div>

                        {/* Client */}
                        <div className="drawer-section">
                            <p className="drawer-section-title"><User size={12} /> Billed To</p>
                            <p className="font-bold text-zinc-800">{invoice.client?.name}</p>
                            <p className="text-sm text-zinc-500">{invoice.client?.email}</p>
                            {invoice.client?.address && <p className="text-sm text-zinc-400 whitespace-pre-line">{invoice.client.address}</p>}
                        </div>

                        {/* Sender */}
                        <div className="drawer-section">
                            <p className="drawer-section-title"><FileText size={12} /> Pay To</p>
                            <p className="font-bold text-zinc-800">{invoice.sender?.name}</p>
                            <p className="text-sm text-zinc-500">{invoice.sender?.email}</p>
                            {invoice.sender?.address && <p className="text-sm text-zinc-400 whitespace-pre-line">{invoice.sender.address}</p>}
                        </div>

                        {/* Line Items */}
                        <div className="drawer-section">
                            <p className="drawer-section-title">Line Items</p>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="text-left py-2 text-zinc-400 font-semibold text-xs">Description</th>
                                        <th className="text-center py-2 text-zinc-400 font-semibold text-xs">Qty</th>
                                        <th className="text-right py-2 text-zinc-400 font-semibold text-xs">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoice.items || []).map((item, i) => (
                                        <tr key={i} className="border-b border-zinc-50">
                                            <td className="py-2 text-zinc-700">{item.description || '—'}</td>
                                            <td className="py-2 text-center text-zinc-500">{item.quantity}</td>
                                            <td className="py-2 text-right font-semibold">{sym}{Number(item.amount || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Financials */}
                        <div className="drawer-section bg-zinc-50 rounded-2xl p-4 space-y-2">
                            <div className="flex justify-between text-sm text-zinc-500">
                                <span>Subtotal</span><span>{sym}{Number(invoice.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {invoice.taxPercentage > 0 && (
                                <div className="flex justify-between text-sm text-zinc-500">
                                    <span>{invoice.taxName || 'Tax'} ({invoice.taxPercentage}%)</span>
                                    <span>{sym}{Number(invoice.taxAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-sm text-zinc-500">
                                    <span>Discount</span><span>-{sym}{Number(invoice.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-black text-lg pt-2 border-t border-zinc-200">
                                <span>Total</span><span>{sym}{Number(invoice.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment / Notes */}
                        {(invoice.paymentQr || invoice.notes) && (
                            <div className="drawer-section">
                                {invoice.paymentQr && (
                                    <div className="mb-3">
                                        <p className="drawer-label">UPI ID</p>
                                        <p className="text-sm font-mono text-zinc-700">{invoice.paymentQr}</p>
                                    </div>
                                )}
                                {invoice.notes && (
                                    <div>
                                        <p className="drawer-label">Notes / Terms</p>
                                        <p className="text-sm text-zinc-500 whitespace-pre-line">{invoice.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Lifecycle timestamps */}
                        <div className="drawer-section grid grid-cols-2 gap-3 text-sm">
                            {invoice.sentAt && <div><p className="drawer-label">Sent</p><p className="drawer-value">{fmtDate(invoice.sentAt)}</p></div>}
                            {invoice.viewedAt && <div><p className="drawer-label">Viewed</p><p className="drawer-value">{fmtDate(invoice.viewedAt)}</p></div>}
                            {invoice.paidAt && <div><p className="drawer-label">Paid</p><p className="drawer-value text-emerald-600 font-bold">{fmtDate(invoice.paidAt)}</p></div>}
                        </div>
                    </div>

                    {/* ── Drawer Footer (sticky) ─────────────────── */}
                    <div className="drawer-footer">
                        <button onClick={handleDownload} className="drawer-action-btn">
                            <Download size={14} /> Download PDF
                        </button>

                        {invoice.status !== 'paid' && (
                            <button onClick={handleMarkPaid} className="drawer-action-btn drawer-action-success">
                                <CheckCircle size={14} /> Mark as Paid
                            </button>
                        )}

                        <button onClick={handleDuplicate} className="drawer-action-btn">
                            <Copy size={14} /> Duplicate
                        </button>

                        <button disabled title="Coming soon" className="drawer-action-btn opacity-40 cursor-not-allowed">
                            <Send size={14} /> Send Reminder
                        </button>

                        <button onClick={handleDelete} className="drawer-action-btn drawer-action-danger">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoiceDrawer;
