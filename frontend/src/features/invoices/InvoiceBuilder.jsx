import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Check, AlertCircle, Upload, ArrowLeft, Send, BookmarkPlus, Minus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoiceApi } from '../../services/api/invoiceApi';
import { clientApi } from '../../services/api/clientApi';
import { uploadApi } from '../../services/api/uploadApi';
import { serviceApi } from '../../services/api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import InvoiceTemplate from '../../components/InvoiceTemplate';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormSection from './components/FormSection';
import InputField from './components/InputField';
import LineItemRow from './components/LineItemRow';
import { toast } from 'react-hot-toast';

// ---------------------------------------------------------------------------

const InvoiceBuilder = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const { user } = useAuth();
    const navigate = useNavigate();

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
    const [isSending, setIsSending] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [clients, setClients] = useState([]);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [localToast, setLocalToast] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [qrPreview, setQrPreview] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [savedServices, setSavedServices] = useState([]);
    const [activeServiceIdx, setActiveServiceIdx] = useState(-1);
    const [zoom, setZoom] = useState(0.55);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await clientApi.getAll();
                setClients(data);
            } catch (err) {
                console.error('Failed to load clients safely', err);
            }
        };
        const loadServices = async () => {
            try {
                const data = await serviceApi.getAll();
                setSavedServices(data);
            } catch (err) {
                console.error('Failed to load services', err);
            }
        };
        loadClients();
        loadServices();

        if (id) {
            fetchInvoice(id);
        } else if (user) {
            const fetchDefaults = async () => {
                let defaultData = {
                    sender: {
                        name: user.name || '',
                        email: user.businessEmail || user.email || '',
                        address: user.businessAddress || '',
                        logo: user.logoUrl || '',
                        companyName: user.businessName || ''
                    },
                    currency: user.defaultCurrency || 'USD'
                };
                try {
                    const lastInvoice = await invoiceApi.getLast();
                    if (lastInvoice) {
                        defaultData.taxName = lastInvoice.taxName;
                        defaultData.taxPercentage = lastInvoice.taxPercentage;
                        defaultData.notes = lastInvoice.notes;
                        defaultData.paymentQr = lastInvoice.paymentQr;
                        if (lastInvoice.qrCodeImage) {
                            setQrPreview(lastInvoice.qrCodeImage);
                            defaultData.qrCodeImage = lastInvoice.qrCodeImage;
                        }
                        if (lastInvoice.currency) defaultData.currency = lastInvoice.currency;
                    }
                } catch (err) {
                    // Silently ignore
                }
                setInvoice(prev => ({ ...prev, ...defaultData }));
                if (user.logoUrl) setLogoPreview(user.logoUrl);
            };
            fetchDefaults();
        }
    }, [id, user]);

    const fetchInvoice = async (invoiceId) => {
        try {
            const data = await invoiceApi.getById(invoiceId);
            setInvoice(data);
            if (data.sender?.logo) setLogoPreview(data.sender.logo);
            if (data.qrCodeImage) setQrPreview(data.qrCodeImage);
            setIsDirty(false);
        } catch (error) {
            showToast('Error fetching invoice details', 'error');
            navigate('/invoices');
        }
    };

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
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount - invoice.discount;

    const updateInvoice = (field, value) => {
        setInvoice(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const updateNestedInvoice = (category, field, value) => {
        setInvoice(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
        setIsDirty(true);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index][field] = value;
        newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        setInvoice(prev => ({ ...prev, items: newItems }));
        setIsDirty(true);
    };

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        }));
        setIsDirty(true);
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) return;
        setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        setIsDirty(true);
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { showToast('File size must be less than 2MB', 'error'); return; }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { showToast('Only JPG, JPEG, and PNG images are allowed', 'error'); return; }
            const t = toast.loading('Processing logo...');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setLogoPreview(base64String);
                updateNestedInvoice('sender', 'logo', base64String);
                toast.success('Logo embedded successfully', { id: t });
            };
            reader.onerror = () => {
                toast.error('Failed to process logo', { id: t });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleQrUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { showToast('File size must be less than 2MB', 'error'); return; }
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { showToast('Only JPG, JPEG, and PNG images are allowed', 'error'); return; }
            const t = toast.loading('Processing QR...');
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setQrPreview(base64String);
                updateInvoice('qrCodeImage', base64String);
                toast.success('QR Code embedded successfully', { id: t });
            };
            reader.onerror = () => {
                toast.error('Failed to process QR code', { id: t });
            };
            reader.readAsDataURL(file);
        }
    };

    const showToast = useCallback((message, type = 'success') => {
        setLocalToast({ message, type });
        setTimeout(() => setLocalToast(null), 3000);
    }, []);

    const saveInvoice = async (isDraft = true, silent = false) => {
        if (!invoice.client.name && !isDraft) {
            if (!silent) showToast('Please fill in client name', 'error');
            return null;
        }
        try {
            const payload = { ...invoice, subtotal, taxAmount, totalAmount, isDraft };
            let responseData;
            if (isEditMode || invoice._id) {
                const targetId = invoice._id || id;
                responseData = await invoiceApi.update(targetId, payload);
                setInvoice(responseData);
                if (!silent) showToast('Invoice updated successfully!');
            } else {
                responseData = await invoiceApi.create(payload);
                setInvoice(responseData);
                if (responseData._id) navigate(`/invoices/edit/${responseData._id}`, { replace: true });
                if (!silent) showToast('Draft saved successfully!');
            }
            setIsDirty(false);
            return responseData;
        } catch (error) {
            if (!silent) showToast(error.message || 'Error saving invoice', 'error');
            return null;
        }
    };

    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => saveInvoice(true, true), 3000);
        return () => clearTimeout(timer);
    }, [invoice, isDirty]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveInvoice(true, false); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); generatePDF(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [invoice, isDirty]);

    const generatePDF = async () => {
        const savedInvoice = await saveInvoice(false, true);
        if (!savedInvoice) { showToast('Failed to save before downloading', 'error'); return; }
        setIsGenerating(true);
        try {
            const pdfBlobData = await invoiceApi.downloadPdf(savedInvoice._id);
            
            // Safety check: if the backend sent a 500 error, Axios with responseType='blob' might wrap JSON in a Blob
            if (pdfBlobData.type && pdfBlobData.type.includes('application/json')) {
                const text = await pdfBlobData.text();
                throw new Error(JSON.parse(text).message || 'Server returned an error instead of a PDF');
            }

            const url = window.URL.createObjectURL(new Blob([pdfBlobData], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `INV-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast('Invoice downloaded successfully!');
        } catch (error) {
            showToast('Error generating invoice', 'error');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSend = async () => {
        if (!invoice.client.email) { showToast('Please add a client email before sending.', 'error'); return; }
        const savedInvoice = await saveInvoice(false, true);
        if (!savedInvoice) { showToast('Failed to save before sending', 'error'); return; }
        setIsSending(true);
        try {
            await invoiceApi.send(savedInvoice._id, { message: customMessage });
            showToast('Invoice sent to client successfully!');
            setIsMessageModalOpen(false);
            setCustomMessage('');
            setInvoice(prev => ({ ...prev, status: 'sent' }));
        } catch (error) {
            showToast(error.message || 'Error sending invoice', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-white font-sans">

            {/* ── LEFT: Form Area (fluid) ────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar min-w-0">

                {/* Sticky form header */}
                <header className="flex items-center justify-between px-8 py-3.5 border-b border-slate-200 bg-white sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/invoices')} className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
                            {isEditMode ? 'Edit Invoice' : 'New Invoice'}
                            {isDirty && (
                                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-widest">
                                    Unsaved
                                </span>
                            )}
                        </h1>
                    </div>
                    <button
                        onClick={() => saveInvoice(true, false)}
                        className="text-[11px] font-medium text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        Save Draft
                    </button>
                </header>

                {/* Form content */}
                <div className="px-8 py-6 max-w-3xl mx-auto w-full pb-32">

                    {/* Section 1: Document Details */}
                    <FormSection title="Document Details">
                        <div className="flex gap-5 items-start">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <InputField
                                    label="Invoice No"
                                    value={invoice.invoiceNumber}
                                    onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
                                    placeholder="INV-001"
                                />
                                <div className="flex flex-col gap-1 w-full">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Currency</label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-slate-200 focus:border-brand-base focus:outline-none text-slate-900 bg-white h-9 rounded-none"
                                        value={invoice.currency}
                                        onChange={(e) => updateInvoice('currency', e.target.value)}
                                    >
                                        {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                    </select>
                                </div>
                                <InputField label="Issue Date" type="date" value={invoice.issueDate} onChange={(e) => updateInvoice('issueDate', e.target.value)} />
                                <InputField label="Due Date" type="date" value={invoice.dueDate} onChange={(e) => updateInvoice('dueDate', e.target.value)} />
                            </div>
                            <div className="shrink-0 flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Logo</label>
                                {logoPreview ? (
                                    <div className="relative group/logo mt-1">
                                        <img src={logoPreview} alt="Logo" className="w-[88px] h-[88px] object-contain border border-slate-200 bg-slate-50 p-2" />
                                        <button
                                            onClick={() => { setLogoPreview(''); updateNestedInvoice('sender', 'logo', ''); }}
                                            className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-[88px] h-[88px] border border-dashed border-slate-200 hover:border-brand-base cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 mt-1">
                                        <Upload className="w-4 h-4 mb-1" />
                                        <span className="text-[9px] font-bold tracking-widest uppercase">Upload</span>
                                        <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Section 2: Parties */}
                    <div className="grid grid-cols-2 gap-6">
                        <FormSection title="From (Sender)">
                            <InputField label="Company" value={invoice.sender.companyName} onChange={e => updateNestedInvoice('sender', 'companyName', e.target.value)} placeholder="Your Company" />
                            <InputField label="Name" value={invoice.sender.name} onChange={e => updateNestedInvoice('sender', 'name', e.target.value)} placeholder="Your Name" />
                            <InputField label="Email" type="email" value={invoice.sender.email} onChange={e => updateNestedInvoice('sender', 'email', e.target.value)} placeholder="you@company.com" />
                            <InputField label="Address" type="textarea" value={invoice.sender.address} onChange={e => updateNestedInvoice('sender', 'address', e.target.value)} placeholder="123 Sender Street..." />
                        </FormSection>

                        <FormSection title="Billed To (Client)">
                            <div className="relative">
                                <InputField
                                    label="Client"
                                    value={invoice.client.name}
                                    onChange={e => { updateNestedInvoice('client', 'name', e.target.value); setShowClientDropdown(true); }}
                                    onFocus={() => setShowClientDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                    placeholder="Client Name or Company"
                                />
                                <AnimatePresence>
                                    {showClientDropdown && invoice.client.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg max-h-48 overflow-y-auto z-50"
                                        >
                                            {clients.filter(c =>
                                                c.name.toLowerCase().includes(invoice.client.name.toLowerCase()) ||
                                                (c.companyName && c.companyName.toLowerCase().includes(invoice.client.name.toLowerCase())) ||
                                                (c.email && c.email.toLowerCase().includes(invoice.client.name.toLowerCase()))
                                            ).length > 0 ? (
                                                clients.filter(c =>
                                                    c.name.toLowerCase().includes(invoice.client.name.toLowerCase()) ||
                                                    (c.companyName && c.companyName.toLowerCase().includes(invoice.client.name.toLowerCase())) ||
                                                    (c.email && c.email.toLowerCase().includes(invoice.client.name.toLowerCase()))
                                                ).map(client => (
                                                    <div
                                                        key={client._id}
                                                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                                                        onClick={() => {
                                                            updateNestedInvoice('client', 'name', client.name);
                                                            updateNestedInvoice('client', 'email', client.email || '');
                                                            updateNestedInvoice('client', 'address', client.address || '');
                                                            setShowClientDropdown(false);
                                                        }}
                                                    >
                                                        <div className="text-sm font-semibold text-slate-900">{client.companyName ? `${client.name} (${client.companyName})` : client.name}</div>
                                                        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{client.email}</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-slate-500 italic">No match — will be created on save.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <InputField label="Email" type="email" value={invoice.client.email} onChange={e => updateNestedInvoice('client', 'email', e.target.value)} placeholder="client@company.com" />
                            <InputField label="Address" type="textarea" value={invoice.client.address} onChange={e => updateNestedInvoice('client', 'address', e.target.value)} placeholder="456 Client Avenue..." />
                        </FormSection>
                    </div>

                    {/* Section 3: Line Items */}
                    <FormSection title="Services Rendered">
                        <div className="space-y-2">
                            <div className="grid grid-cols-[1fr_72px_110px_96px_36px] gap-3 pb-2 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                <div>Description</div>
                                <div className="text-center">Qty</div>
                                <div className="text-right">Rate</div>
                                <div className="text-right">Amount</div>
                                <div></div>
                            </div>
                            {invoice.items.map((item, index) => (
                                <LineItemRow
                                    key={index}
                                    item={item}
                                    index={index}
                                    currencySymbol={currencySymbol}
                                    onChange={handleItemChange}
                                    onRemove={removeItem}
                                    isActive={activeServiceIdx === index}
                                    onFocus={setActiveServiceIdx}
                                    onBlur={() => setTimeout(() => setActiveServiceIdx(-1), 200)}
                                    savedServices={savedServices}
                                    onSelectService={(idx, svc) => {
                                        handleItemChange(idx, 'description', svc.name);
                                        handleItemChange(idx, 'rate', svc.price);
                                        setActiveServiceIdx(-1);
                                    }}
                                />
                            ))}
                            <div className="flex items-center gap-3 pt-2">
                                <Button variant="secondary" onClick={addItem} className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-none">
                                    <Plus size={13} className="mr-1.5" /> Add Line Item
                                </Button>
                                {invoice.items.some(i => i.description && i.rate > 0) && (
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const item = invoice.items.find(i => i.description && i.rate > 0);
                                            if (!item) return;
                                            try {
                                                const newSvc = await serviceApi.create({ name: item.description, description: '', price: item.rate });
                                                setSavedServices(prev => [...prev, newSvc]);
                                                toast.success(`"${item.description}" saved as reusable service`);
                                            } catch (err) {
                                                toast.error(err.message || 'Failed to save service');
                                            }
                                        }}
                                        className="text-xs py-1.5 px-3 border-transparent hover:border-slate-200 shadow-none text-brand-base bg-brand-base/5"
                                    >
                                        <BookmarkPlus size={13} className="mr-1.5" /> Save as Template
                                    </Button>
                                )}
                            </div>
                        </div>
                    </FormSection>

                    {/* Section 4: Payment & Totals */}
                    <div className="grid grid-cols-2 gap-6">
                        <FormSection title="Payment Details">
                            <InputField label="Bank / Wallet Instructions" value={invoice.paymentQr} onChange={(e) => updateInvoice('paymentQr', e.target.value)} placeholder="Bank: XYZ, Acct: 1234..." />
                            <InputField label="Additional Notes" type="textarea" value={invoice.notes} onChange={(e) => updateInvoice('notes', e.target.value)} placeholder="Thank you for your business!" />
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">QR Code</label>
                                {qrPreview ? (
                                    <div className="relative inline-block group/qr mt-1 w-fit">
                                        <img src={qrPreview} alt="QR Code" className="w-20 h-20 object-contain border border-slate-200 bg-white p-2" />
                                        <button onClick={() => { setQrPreview(''); updateInvoice('qrCodeImage', ''); }} className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 p-1 opacity-0 group-hover/qr:opacity-100 transition-opacity">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 hover:border-brand-base w-fit mt-1">
                                        <Plus className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Upload QR</span>
                                        <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleQrUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </FormSection>

                        <FormSection title="Financial Summary">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                                    <span className="text-xs text-slate-500">Subtotal</span>
                                    <span className="text-sm font-semibold text-slate-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <InputField label="Tax Name" value={invoice.taxName} onChange={(e) => updateInvoice('taxName', e.target.value)} placeholder="VAT" />
                                    </div>
                                    <div className="w-20">
                                        <InputField label="Tax %" type="number" value={invoice.taxPercentage} onChange={(e) => updateInvoice('taxPercentage', Number(e.target.value))} />
                                    </div>
                                </div>
                                <InputField label="Discount" type="number" value={invoice.discount} onChange={(e) => updateInvoice('discount', Number(e.target.value))} />
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                                    <span className="text-sm font-bold text-slate-900">Total Due</span>
                                    <span className="text-xl font-black text-slate-900">{currencySymbol}{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </FormSection>
                    </div>

                </div>
            </div>

            {/* ── RIGHT: Preview Panel ────────────────────────────────── */}
            <div className="hidden lg:flex flex-1 bg-[#f1f3f5] border-l border-slate-200 flex-col overflow-hidden" style={{ maxWidth: '50%' }}>

                {/* Preview toolbar */}
                <div className="h-[52px] border-b border-slate-200/80 bg-white flex items-center justify-between px-5 shrink-0">
                    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 border border-slate-200 rounded">
                        <button
                            onClick={() => setZoom(Math.max(0.3, +(zoom - 0.1).toFixed(1)))}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-all"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="text-[11px] font-semibold w-10 text-center text-slate-600 tabular-nums">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(Math.min(1.5, +(zoom + 0.1).toFixed(1)))}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white rounded transition-all"
                        >
                            <Plus size={13} />
                        </button>
                        <div className="w-px h-3 bg-slate-300 mx-0.5"></div>
                        <button
                            onClick={() => setZoom(0.55)}
                            className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-white rounded transition-all"
                        >
                            Fit
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={generatePDF}
                            isLoading={isGenerating}
                            disabled={isSending}
                            className="px-3 py-1.5 text-xs shadow-none h-7 border-slate-200 bg-white hover:bg-slate-50 rounded"
                        >
                            <Download size={12} className="mr-1" /> PDF
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsMessageModalOpen(true)}
                            disabled={isGenerating}
                            className="px-3 py-1.5 text-xs shadow-none h-7 bg-brand-base hover:bg-brand-hover border-transparent rounded"
                        >
                            Send <Send size={11} className="ml-1" />
                        </Button>
                    </div>
                </div>

                {/* A4 canvas — wrapper sizes to the scaled output so centering works naturally */}
                <div className="flex-1 overflow-auto bg-[#eaecef] flex justify-center items-start py-10 custom-scrollbar">
                    <div
                        className="shrink-0"
                        style={{
                            width: `${Math.round(794 * zoom)}px`,
                            height: `${Math.round(1123 * zoom)}px`,
                        }}
                    >
                        <div
                            className="bg-white shadow-[0_2px_16px_rgba(0,0,0,0.08)] origin-top-left"
                            style={{
                                width: '794px',
                                height: '1123px',
                                transform: `scale(${zoom})`,
                            }}
                        >
                            <InvoiceTemplate
                                invoice={invoice}
                                subtotal={subtotal}
                                taxAmount={taxAmount}
                                totalAmount={totalAmount}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Toast ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {localToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2.5 shadow-xl border flex items-center gap-2 z-[100] ${localToast.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-slate-900 border-slate-900 text-white'}`}
                    >
                        {localToast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} className="text-emerald-400" />}
                        <span className="font-semibold text-xs tracking-widest uppercase">{localToast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Send Modal ────────────────────────────────────────────── */}
            <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title={`Send Invoice #${invoice.invoiceNumber}`}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">
                        This will generate a final PDF, create a secure public link, and email it directly to <strong>{invoice.client.email || 'the client'}</strong>.
                    </p>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Optional Message</label>
                        <textarea
                            className="w-full border border-slate-200 p-3 focus:outline-none focus:border-brand-base text-sm resize-none min-h-[100px]"
                            placeholder="Hi there, thanks for your business! Here is the invoice..."
                            value={customMessage}
                            onChange={e => setCustomMessage(e.target.value)}
                            disabled={isSending}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setIsMessageModalOpen(false)} disabled={isSending}>Cancel</Button>
                    <Button variant="primary" onClick={handleSend} isLoading={isSending} disabled={!invoice.client.email}>Send Now</Button>
                </div>
            </Modal>
        </div>
    );
};

export default InvoiceBuilder;
