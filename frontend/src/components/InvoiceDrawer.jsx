import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, Copy, Trash2, ExternalLink, Calendar, Clock, AlertTriangle, Send, User, FileText, MessageCircle, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import { toast } from 'react-hot-toast';
import Button from './ui/Button';

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const STATUS_STYLES = {
    draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-600' },
    pending: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' },
    sent: { label: 'Pending', cls: 'bg-yellow-50 text-yellow-700' }, // Map legacy sent
    paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700' },
    overdue: { label: 'Overdue', cls: 'bg-red-50 text-red-600' },
};

const computeOverdue = (inv) => !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const InvoiceDrawer = ({ invoice, onClose, onUpdate, onDelete, onDuplicate }) => {
    const drawerRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleOverlayClick = (e) => {
        if (drawerRef.current && !drawerRef.current.contains(e.target)) onClose();
    };

    if (!invoice) return null;

    const sym = currSym(invoice.currency);
    const isOverdue = computeOverdue(invoice);
    
    let effStatus = invoice.status?.toLowerCase() || 'draft';
    if (invoice.isDraft) effStatus = 'draft';
    if (effStatus !== 'paid' && isOverdue) effStatus = 'overdue';

    const status = STATUS_STYLES[effStatus] || { label: effStatus, cls: 'bg-slate-100 text-slate-600' };

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

    const publicUrl = `${window.location.origin}/p/${invoice.publicId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicUrl);
        toast.success('Public link copied!');
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Here is your invoice from ${invoice.sender.companyName || invoice.sender.name}: ${publicUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" onClick={handleOverlayClick}>
                <motion.div
                    ref={drawerRef}
                    className="h-full bg-bg-base flex flex-col z-50 shadow-2xl border-l border-border-base w-full md:w-[480px]"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-border-base shrink-0">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-text-primary uppercase tracking-widest">
                                    #{invoice.invoiceNumber}
                                </span>
                                {isOverdue && (
                                    <span className="badge-overdue bg-red-50 text-red-500 border border-red-100 text-[9px] px-1 rounded">
                                        <AlertTriangle size={9} /> Overdue
                                    </span>
                                )}
                            </div>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${status.cls}`}>
                                {status.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <a href={`/dashboard?edit=${invoice._id}`} className="p-1.5 rounded text-slate-400 hover:text-text-primary hover:bg-slate-100 transition-colors" title="Edit invoice">
                                <ExternalLink size={16} />
                            </a>
                            <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-text-primary hover:bg-slate-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-none p-4 shadow-none">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-bold tracking-tight text-slate-900">
                                {sym}{Number(invoice.totalAmount).toFixed(2)}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-white border border-slate-200 rounded-none p-4 shadow-none">
                            <div>
                                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mb-1">Issue Date</p>
                                <p className="text-sm font-medium flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {fmtDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mb-1">Due Date</p>
                                <p className={`text-sm font-medium flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                                    <Clock size={12} className={isOverdue ? 'text-red-400' : 'text-slate-400'} /> {fmtDate(invoice.dueDate)}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-border-base rounded p-4 shadow-sm">
                            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-1"><User size={12} /> Billed To</p>
                            <p className="font-semibold text-text-primary text-sm">{invoice.client?.name}</p>
                            <p className="text-sm text-text-secondary">{invoice.client?.email}</p>
                            {invoice.client?.address && <p className="text-sm text-text-secondary whitespace-pre-line mt-1">{invoice.client.address}</p>}
                        </div>

                        <div className="bg-white border border-border-base rounded p-4 shadow-sm">
                            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-1"><FileText size={12} /> Pay To</p>
                            <p className="font-semibold text-text-primary text-sm">{invoice.sender?.name}</p>
                            <p className="text-sm text-text-secondary">{invoice.sender?.email}</p>
                            {invoice.sender?.address && <p className="text-sm text-text-secondary whitespace-pre-line mt-1">{invoice.sender.address}</p>}
                        </div>

                        <div className="bg-white border border-border-base rounded shadow-sm overflow-hidden text-sm">
                            <div className="bg-slate-50 px-4 py-2 border-b border-border-base text-[10px] font-semibold text-text-secondary uppercase tracking-widest">
                                Line Items
                            </div>
                            <div className="divide-y divide-border-base">
                                {(invoice.items || []).map((item, i) => (
                                    <div key={i} className="px-4 py-3 flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium text-text-primary">{item.description || '—'}</p>
                                            <p className="text-xs text-text-secondary mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right font-medium text-text-primary">
                                            {sym}{Number(item.amount || 0).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-border-base rounded p-4 shadow-sm space-y-2 text-sm">
                            <div className="flex justify-between text-text-secondary">
                                <span>Subtotal</span><span>{sym}{Number(invoice.subtotal || 0).toFixed(2)}</span>
                            </div>
                            {invoice.taxPercentage > 0 && (
                                <div className="flex justify-between text-text-secondary">
                                    <span>{invoice.taxName || 'Tax'} ({invoice.taxPercentage}%)</span>
                                    <span>{sym}{Number(invoice.taxAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            {invoice.discount > 0 && (
                                <div className="flex justify-between text-text-secondary">
                                    <span>Discount</span><span>-{sym}{Number(invoice.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border-base text-text-primary">
                                <span>Total</span><span>{sym}{Number(invoice.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Lifecycle timestamps */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {invoice.sentAt && <div className="bg-white p-3 rounded border border-border-base"><p className="text-slate-400 font-semibold uppercase tracking-widest mb-1 text-[9px]">Sent</p><p className="font-medium">{fmtDate(invoice.sentAt)}</p></div>}
                            {invoice.paidAt && <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-3 rounded"><p className="text-emerald-500 font-semibold uppercase tracking-widest mb-1 text-[9px]">Paid</p><p className="font-medium">{fmtDate(invoice.paidAt)}</p></div>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-white border-t border-border-base shrink-0 flex gap-2 flex-wrap">
                        <Button variant="secondary" onClick={handleDownload} className="flex-1 text-xs py-2 shadow-none"><Download size={14} className="mr-1.5" /> PDF</Button>
                        <Button variant="secondary" onClick={handleCopyLink} className="flex-1 text-xs py-2 shadow-none"><Copy size={14} className="mr-1.5" /> Link</Button>
                        <Button variant="secondary" onClick={handleWhatsApp} className="flex-1 text-xs py-2 shadow-none text-green-600 border-green-200 hover:bg-green-50"><MessageCircle size={14} className="mr-1.5" /> Share</Button>
                        <Button variant="secondary" onClick={handleDelete} className="text-xs py-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-none"><Trash2 size={14} /></Button>
                        
                        {invoice.status !== 'paid' && (
                            <Button variant="primary" onClick={handleMarkPaid} className="w-full mt-2 text-xs py-2 shadow-none bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle size={14} className="mr-1.5" /> Mark as Paid
                            </Button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default InvoiceDrawer;
