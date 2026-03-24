import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Check, Save, AlertCircle, Upload, ArrowLeft, Eye, Edit3 } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import LivePreview from '../components/LivePreview';
import Button from '../components/ui/Button';

const Dashboard = () => {
    const [invoice, setInvoice] = useState({
        invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        sender: { name: '', email: '', address: '', logo: '', companyName: '' },
        client: { name: '', email: '', address: '' },
        items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
        taxName: 'VAT',
        taxPercentage: 0,
        discount: 0,
        notes: '',
        paymentQr: '',
        qrCodeImage: '',
        currency: 'USD'
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [qrPreview, setQrPreview] = useState('');
    const [mobileTab, setMobileTab] = useState('edit');

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const invoiceId = searchParams.get('edit');
    const isEditMode = !!invoiceId;

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US' },
        { code: 'EUR', symbol: '€', name: 'EU' },
        { code: 'GBP', symbol: '£', name: 'UK' },
        { code: 'INR', symbol: '₹', name: 'IN' },
        { code: 'AUD', symbol: 'A$', name: 'AU' },
        { code: 'CAD', symbol: 'C$', name: 'CA' },
        { code: 'SGD', symbol: 'S$', name: 'SG' },
    ];

    const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || invoice.currency;

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice(invoiceId);
        } else if (user?.businessDetails) {
            setInvoice(prev => ({
                ...prev,
                sender: {
                    name: user.businessDetails.name || '',
                    email: user.businessDetails.email || '',
                    address: user.businessDetails.address || '',
                    logo: user.businessDetails.logo || '',
                    companyName: user.businessDetails.companyName || ''
                }
            }));
            if (user.businessDetails.logo) setLogoPreview(user.businessDetails.logo);
        }
    }, [invoiceId, user]);

    const fetchInvoice = async (id) => {
        try {
            const { data } = await api.get(`/invoices/${id}`);
            setInvoice(data);
            if (data.sender.logo) setLogoPreview(data.sender.logo);
            if (data.qrCodeImage) setQrPreview(data.qrCodeImage);
        } catch (error) {
            showToast('Error fetching invoice details', 'error');
            navigate('/dashboard');
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setLogoPreview(base64String);
                setInvoice(prev => ({ ...prev, sender: { ...prev.sender, logo: base64String } }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQrUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setQrPreview(base64String);
                setInvoice(prev => ({ ...prev, qrCodeImage: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const updatedItems = invoice.items.map(item => ({
            ...item,
            amount: item.quantity * item.rate
        }));
        if (JSON.stringify(updatedItems) !== JSON.stringify(invoice.items)) {
            setInvoice(prev => ({ ...prev, items: updatedItems }));
        }
    }, [invoice.items]);

    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount - invoice.discount;

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = value;
        setInvoice(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) return;
        setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const saveInvoice = async (isDraft = false) => {
        if (!isDraft && (!invoice.client.name || !invoice.sender.name)) {
            showToast('Please fill in sender and client names', 'error');
            return null;
        }

        setIsGenerating(true);
        try {
            const payload = { ...invoice, subtotal, taxAmount, totalAmount, isDraft };
            let response;
            if (isEditMode) {
                response = await api.put(`/invoices/${invoice._id}`, payload);
                showToast('Invoice updated successfully!');
            } else {
                response = await api.post('/invoices', payload);
                if (isDraft) showToast('Draft saved successfully!');
            }
            return response.data;
        } catch (error) {
            showToast(error.response?.data?.message || 'Error saving invoice', 'error');
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const generatePDF = async () => {
        const savedInvoice = await saveInvoice(false);
        if (!savedInvoice) return;

        setIsGenerating(true);
        try {
            const pdfResponse = await api.get(`/invoices/${savedInvoice._id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `INV-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast('Invoice downloaded successfully!');
            if (!isEditMode) navigate('/invoices');
        } catch (error) {
            showToast('Error generating invoice', 'error');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const InputLine = ({ label, value, onChange, placeholder, type = 'text', width = 'w-full' }) => (
        <div className={`flex items-center gap-4 py-1.5 border-b border-border-base/50 group ${width}`}>
            <label className="text-xs font-semibold text-text-secondary w-28 shrink-0">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-sm text-text-primary focus:outline-none placeholder:text-slate-300"
            />
        </div>
    );

    const TextareaLine = ({ label, value, onChange, placeholder }) => (
        <div className="flex items-start gap-4 py-1.5 border-b border-border-base/50 group w-full">
            <label className="text-xs font-semibold text-text-secondary w-28 shrink-0 pt-1">{label}</label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-sm text-text-primary focus:outline-none placeholder:text-slate-300 resize-none min-h-[60px]"
            />
        </div>
    );

    const SectionHeader = ({ title }) => (
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary pt-6 pb-2 border-b-2 border-slate-900 mb-2">
            {title}
        </h3>
    );

    const InvoiceForm = () => (
        <div className="invoice-form-panel bg-white border border-border-base shadow-sm rounded-md overflow-hidden relative min-h-[calc(100vh-8rem)]">
            
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between p-4 bg-bg-base border-b border-border-base sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {isEditMode && (
                        <button onClick={() => navigate('/invoices')} className="p-1.5 hover:bg-slate-200 rounded transition-colors">
                            <ArrowLeft className="w-4 h-4 text-text-secondary" />
                        </button>
                    )}
                    <h1 className="text-base font-semibold text-text-primary">
                        {isEditMode ? 'Edit Invoice' : 'New Invoice'}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => saveInvoice(true)} disabled={isGenerating} size="sm" className="text-xs px-3 py-1.5">
                        {isEditMode ? 'Save Draft' : 'Save'}
                    </Button>
                    <Button variant="primary" onClick={generatePDF} disabled={isGenerating} size="sm" className="lg:hidden text-xs px-3 py-1.5">
                        {isGenerating ? 'Processing…' : 'Generate'}
                    </Button>
                </div>
            </div>

            <div className="p-6 md:p-8 space-y-8">
                {/* General Info */}
                <div>
                    <SectionHeader title="Document Identity" />
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-4">
                        <div className="w-full space-y-1">
                            <InputLine label="Invoice No" value={invoice.invoiceNumber} onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))} placeholder="INV-001" />
                            <InputLine label="Issue Date" type="date" value={invoice.issueDate} onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))} />
                            <InputLine label="Due Date" type="date" value={invoice.dueDate} onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))} />
                            
                            <div className="flex items-center gap-4 py-1.5 border-b border-border-base/50 group w-full">
                                <label className="text-xs font-semibold text-text-secondary w-28 shrink-0">Currency</label>
                                <select
                                    className="bg-transparent text-sm text-text-primary focus:outline-none w-full"
                                    value={invoice.currency}
                                    onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                                >
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Logo Upload Box (Notion Style) */}
                        <div className="shrink-0">
                            {logoPreview ? (
                                <div className="relative group/logo">
                                    <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain border border-border-base rounded bg-white" />
                                    <button
                                        onClick={() => { setLogoPreview(''); setInvoice(prev => ({ ...prev, sender: { ...prev.sender, logo: '' } })); }}
                                        className="absolute -top-2 -right-2 bg-white border border-border-base text-red-500 rounded p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 hover:text-text-primary">
                                    <Upload className="w-4 h-4 mb-1" />
                                    <span className="text-[9px] font-semibold uppercase">Logo</span>
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                {/* Parties */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <SectionHeader title="From (Sender)" />
                        <div className="space-y-1">
                            <InputLine label="Company" value={invoice.sender.companyName} onChange={e => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, companyName: e.target.value } }))} placeholder="Acme Inc" />
                            <InputLine label="Name" value={invoice.sender.name} onChange={e => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, name: e.target.value } }))} placeholder="Your Name" />
                            <InputLine label="Email" type="email" value={invoice.sender.email} onChange={e => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, email: e.target.value } }))} placeholder="you@acme.com" />
                            <TextareaLine label="Address" value={invoice.sender.address} onChange={e => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, address: e.target.value } }))} placeholder="123 Street..." />
                        </div>
                    </div>
                    <div>
                        <SectionHeader title="Billed To (Client)" />
                        <div className="space-y-1">
                            <InputLine label="Company/Name" value={invoice.client.name} onChange={e => setInvoice(prev => ({ ...prev, client: { ...prev.client, name: e.target.value } }))} placeholder="Client Name" />
                            <InputLine label="Email" type="email" value={invoice.client.email} onChange={e => setInvoice(prev => ({ ...prev, client: { ...prev.client, email: e.target.value } }))} placeholder="client@company.com" />
                            <TextareaLine label="Address" value={invoice.client.address} onChange={e => setInvoice(prev => ({ ...prev, client: { ...prev.client, address: e.target.value } }))} placeholder="456 Avenue..." />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div>
                    <SectionHeader title="Line Items" />
                    
                    <div className="hidden md:flex gap-4 pb-2 border-b border-border-base text-[10px] font-semibold uppercase text-text-secondary tracking-wider mb-2">
                        <div className="flex-1">Description</div>
                        <div className="w-16 text-center">Qty</div>
                        <div className="w-24 text-right">Rate</div>
                        <div className="w-24 text-right">Amount</div>
                        <div className="w-6"></div>
                    </div>

                    <div className="space-y-4 md:space-y-2">
                        {invoice.items.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center relative group p-3 md:p-0 border border-border-base md:border-transparent rounded bg-slate-50 md:bg-transparent">
                                <div className="flex-1 w-full">
                                    <label className="md:hidden text-[10px] font-semibold uppercase text-text-secondary mb-1 block">Description</label>
                                    <input 
                                        placeholder="Item description..." 
                                        className="w-full bg-transparent text-sm text-text-primary focus:outline-none placeholder:text-slate-300 md:py-1 border-b border-transparent focus:border-border-base" 
                                        value={item.description} 
                                        onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                                    />
                                </div>
                                <div className="flex w-full md:w-auto gap-4 md:items-center">
                                    <div className="w-1/2 md:w-16">
                                        <label className="md:hidden text-[10px] font-semibold uppercase text-text-secondary mb-1 block">Qty</label>
                                        <input 
                                            type="number" min="1" 
                                            className="w-full bg-transparent text-sm text-center focus:outline-none md:py-1 border-b border-transparent focus:border-border-base" 
                                            value={item.quantity} 
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className="w-1/2 md:w-24 relative">
                                        <label className="md:hidden text-[10px] font-semibold uppercase text-text-secondary mb-1 block">Rate</label>
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 md:top-auto md:translate-y-0 text-text-secondary text-sm md:py-1">{currencySymbol}</span>
                                        <input 
                                            type="number" min="0" step="0.01" 
                                            className="w-full bg-transparent text-sm text-right focus:outline-none pl-6 md:py-1 border-b border-transparent focus:border-border-base" 
                                            value={item.rate} 
                                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} 
                                        />
                                    </div>
                                </div>
                                <div className="w-full md:w-24 text-right text-sm font-semibold text-text-primary pt-2 md:pt-0 border-t border-border-base md:border-none mt-2 md:mt-0 flex justify-between md:block">
                                    <span className="md:hidden text-[10px] uppercase text-text-secondary">Amount</span>
                                    <span>{currencySymbol}{(item.quantity * item.rate).toFixed(2)}</span>
                                </div>
                                <button onClick={() => removeItem(index)} className="absolute top-2 right-2 md:relative md:top-auto md:right-auto w-6 h-6 flex justify-center items-center text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors md:opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={addItem} 
                        className="mt-4 text-[11px] font-semibold uppercase text-brand-base flex items-center gap-1 hover:text-brand-hover tracking-wider"
                    >
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                </div>

                {/* Footer details */}
                <div className="grid md:grid-cols-2 gap-12 pt-4">
                    <div>
                        <SectionHeader title="Payment Info" />
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1 tracking-wider">Payment Details (Bank, UPI, etc)</label>
                                <input placeholder="e.g. name@bank or Acct No: 12345" className="w-full text-sm border-b border-border-base/50 py-1.5 focus:outline-none placeholder:text-slate-300 bg-transparent" value={invoice.paymentQr} onChange={(e) => setInvoice(prev => ({ ...prev, paymentQr: e.target.value }))} />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-1 tracking-wider">Additional Notes</label>
                                <textarea placeholder="Thank you for your business!" className="w-full text-sm border-b border-border-base/50 py-1.5 focus:outline-none placeholder:text-slate-300 resize-none min-h-[60px] bg-transparent" value={invoice.notes} onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))} />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-semibold text-text-secondary mb-2 tracking-wider">Payment QR (Optional)</label>
                                {qrPreview ? (
                                    <div className="relative inline-block group/qr">
                                        <img src={qrPreview} alt="QR Code" className="w-16 h-16 object-contain border border-border-base rounded bg-white p-1" />
                                        <button onClick={() => { setQrPreview(''); setInvoice(prev => ({ ...prev, qrCodeImage: '' })); }} className="absolute -top-2 -right-2 bg-white border border-border-base text-red-500 rounded p-1 opacity-0 group-hover/qr:opacity-100 transition-opacity shadow-sm">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-slate-300 rounded cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 w-fit">
                                        <Plus className="w-3 h-3" />
                                        <span className="text-xs font-medium text-text-secondary">Attach QR</span>
                                        <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded border border-border-base p-6">
                        <SectionHeader title="Summary" />
                        <div className="space-y-3 mt-4">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-text-secondary">Subtotal</span>
                                <span className="font-semibold text-text-primary">{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-2 text-text-secondary">
                                    <input
                                        type="text"
                                        className="w-16 bg-transparent border-b border-slate-300 text-xs focus:outline-none text-text-primary"
                                        value={invoice.taxName}
                                        onChange={(e) => setInvoice(prev => ({ ...prev, taxName: e.target.value }))}
                                        placeholder="Tax"
                                    />
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            className="w-10 bg-transparent border-b border-slate-300 text-xs focus:outline-none text-right text-text-primary mr-1"
                                            value={invoice.taxPercentage}
                                            onChange={(e) => setInvoice(prev => ({ ...prev, taxPercentage: Number(e.target.value) }))}
                                        />
                                        <span className="text-[10px]">%</span>
                                    </div>
                                </div>
                                <span className="font-medium text-text-primary">{currencySymbol}{taxAmount.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between text-sm items-center pb-4 border-b border-border-base">
                                <span className="text-text-secondary">Discount</span>
                                <div className="flex items-center">
                                    <span className="text-sm font-medium mr-1">- {currencySymbol}</span>
                                    <input
                                        type="number"
                                        className="w-16 bg-transparent border-b border-slate-300 text-sm focus:outline-none text-right font-medium text-text-primary"
                                        value={invoice.discount}
                                        onChange={(e) => setInvoice(prev => ({ ...prev, discount: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xl font-bold pt-2 text-text-primary">
                                <span>Total</span>
                                <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
                            </div>
                            
                            <Button variant="primary" onClick={generatePDF} disabled={isGenerating} className="w-full mt-4 text-sm justify-between shadow-none">
                                {isGenerating ? 'Generating...' : 'Finalize & Download'}
                                <Download size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-base pt-20">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden sticky top-[64px] z-30 bg-white border-b border-border-base px-4 py-2">
                <div className="flex bg-slate-100 rounded p-1 max-w-sm mx-auto">
                    <button
                        onClick={() => setMobileTab('edit')}
                        className={`flex items-center justify-center gap-2 flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${mobileTab === 'edit'
                                ? 'bg-white text-text-primary shadow-sm'
                                : 'text-text-secondary'
                            }`}
                    >
                        <Edit3 size={14} /> Edit
                    </button>
                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`flex items-center justify-center gap-2 flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${mobileTab === 'preview'
                                ? 'bg-brand-base text-white shadow-sm'
                                : 'text-text-secondary'
                            }`}
                    >
                        <Eye size={14} /> Preview
                    </button>
                </div>
            </div>

            <div className="split-layout px-4 sm:px-6 mt-6">
                {/* LEFT: Editor Panel */}
                <div className={`split-left ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
                    <InvoiceForm />
                </div>

                {/* RIGHT: Live Preview Sticky Panel */}
                <div className={`split-right ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="preview-sticky-wrapper">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[10px] uppercase font-semibold tracking-wider text-text-secondary flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                Live Preview
                            </span>
                        </div>
                        <LivePreview
                            invoice={invoice}
                            subtotal={subtotal}
                            taxAmount={taxAmount}
                            totalAmount={totalAmount}
                            currencySymbol={currencySymbol}
                            onDownload={generatePDF}
                            isDownloading={isGenerating}
                        />
                    </div>
                </div>
            </div>

            {/* Global Toastifier */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded shadow-xl flex items-center gap-2 z-[100] ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}
                    >
                        {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-emerald-400" />}
                        <span className="font-semibold text-xs tracking-wide">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
