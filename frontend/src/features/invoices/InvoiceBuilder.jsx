import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Check, AlertCircle, Upload, ArrowLeft, Send, BookmarkPlus } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { invoiceApi } from '../../services/api/invoiceApi';
import { clientApi } from '../../services/api/clientApi';
import { uploadApi } from '../../services/api/uploadApi';
import { serviceApi } from '../../services/api/serviceApi';
import { useAuth } from '../../context/AuthContext';
import LivePreview from '../../components/LivePreview';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

// ---------------------------------------------------------------------------
// P0 BUG FIX: Stable Component Definitions
// Moving these components OUTSIDE the main render function ensures they are NOT
// unmounted/remounted on every keystroke, keeping cursor focus preserved.
// ---------------------------------------------------------------------------

const InputLine = ({ label, value, onChange, placeholder, type = 'text', width = 'w-full', onFocus, onBlur }) => (
    <div className={`flex items-center gap-4 py-1.5 border-b border-slate-200 group ${width}`}>
        <label className="text-xs font-semibold text-slate-500 w-28 shrink-0 tracking-tight">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-300"
        />
    </div>
);

const TextareaLine = ({ label, value, onChange, placeholder }) => (
    <div className="flex items-start gap-4 py-1.5 border-b border-slate-200 group w-full">
        <label className="text-xs font-semibold text-slate-500 w-28 shrink-0 pt-1 tracking-tight">{label}</label>
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-300 resize-none min-h-[60px]"
        />
    </div>
);

const SectionHeader = ({ title }) => (
    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 pt-6 pb-2 border-b-2 border-slate-900 mb-2">
        {title}
    </h3>
);

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
    const [toast, setToast] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [qrPreview, setQrPreview] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [savedServices, setSavedServices] = useState([]);
    const [activeServiceIdx, setActiveServiceIdx] = useState(-1);
    const [mobileTab, setMobileTab] = useState('form'); // 'form' or 'preview'
    
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
                    // Silently ignore if no history exists yet
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

    // Derived values (client-side fallback for fluid typing)
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount - invoice.discount;

    // Helper for updating form smoothly
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
            if (file.size > 2 * 1024 * 1024) {
                showToast('File size must be less than 2MB', 'error');
                return;
            }
            const t = toast.loading('Uploading logo...');
            try {
                const url = await uploadApi.uploadImage(file);
                setLogoPreview(url);
                updateNestedInvoice('sender', 'logo', url);
                toast.success('Uploaded logo successfully', { id: t });
            } catch (err) {
                toast.error(err.message || 'Logo upload failed', { id: t });
            }
        }
    };

    const handleQrUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('File size must be less than 2MB', 'error');
                return;
            }
            const t = toast.loading('Uploading QR...');
            try {
                const url = await uploadApi.uploadImage(file);
                setQrPreview(url);
                updateInvoice('qrCodeImage', url);
                toast.success('Uploaded QR code successfully', { id: t });
            } catch (err) {
                toast.error(err.message || 'QR upload failed', { id: t });
            }
        }
    };

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // Action: Save Draft (Triggered manually or auto-saved)
    const saveInvoice = async (isDraft = true, silent = false) => {
        if (!invoice.client.name && !isDraft) {
            if (!silent) showToast('Please fill in client name', 'error');
            return null;
        }

        try {
            // Include client-computed totals for payload fallback, backend recomputes dynamically
            const payload = { ...invoice, subtotal, taxAmount, totalAmount, isDraft };
            let responseData;
            
            if (isEditMode || invoice._id) {
                const targetId = invoice._id || id;
                responseData = await invoiceApi.update(targetId, payload);
                setInvoice(responseData); // Sync native backend struct
                if (!silent) showToast('Invoice updated successfully!');
            } else {
                responseData = await invoiceApi.create(payload);
                setInvoice(responseData);
                if (responseData._id) {
                    navigate(`/invoices/edit/${responseData._id}`, { replace: true });
                }
                if (!silent) showToast('Draft saved successfully!');
            }
            setIsDirty(false);
            return responseData;
        } catch (error) {
            if (!silent) showToast(error.message || 'Error saving invoice', 'error');
            return null;
        }
    };

    // Auto-Save Effect (Saves every 3 seconds if dirty)
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            saveInvoice(true, true); // silent auto-save
        }, 3000);
        return () => clearTimeout(timer);
    }, [invoice, isDirty]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveInvoice(true, false);
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                generatePDF();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [invoice, isDirty]);

    const generatePDF = async () => {
        const savedInvoice = await saveInvoice(false, true);
        if (!savedInvoice) {
            showToast('Failed to save before downloading', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const pdfBlobData = await invoiceApi.downloadPdf(savedInvoice._id);

            const url = window.URL.createObjectURL(new Blob([pdfBlobData]));
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
        if (!invoice.client.email) {
            showToast('Please add a client email before sending.', 'error');
            return;
        }
        
        const savedInvoice = await saveInvoice(false, true);
        if (!savedInvoice) {
            showToast('Failed to save before sending', 'error');
            return;
        }

        setIsSending(true);
        try {
            await invoiceApi.send(savedInvoice._id, { message: customMessage });
            showToast('Invoice sent to client successfully!');
            setIsMessageModalOpen(false);
            setCustomMessage('');
            // update local status visually
            setInvoice(prev => ({ ...prev, status: 'sent' }));
        } catch (error) {
            showToast(error.message || 'Error sending invoice', 'error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Mobile Tab Bar */}
            <div className="md:hidden flex border-b border-slate-200 bg-white shrink-0">
                <button
                    className={`flex-1 py-3 text-sm font-bold tracking-tight text-center border-b-2 transition-colors ${mobileTab === 'form' ? 'border-brand-base text-brand-base' : 'border-transparent text-slate-500'}`}
                    onClick={() => setMobileTab('form')}
                >Form</button>
                <button
                    className={`flex-1 py-3 text-sm font-bold tracking-tight text-center border-b-2 transition-colors ${mobileTab === 'preview' ? 'border-brand-base text-brand-base' : 'border-transparent text-slate-500'}`}
                    onClick={() => setMobileTab('preview')}
                >Preview</button>
            </div>

            {/* Split View Container */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* LEFT SIDE: BUILDER FORM */}
                <div className={`md:w-1/2 w-full flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-10 ${mobileTab !== 'form' ? 'hidden md:flex' : ''}`}>
                    
                    {/* Top Sticky Actions Bar */}
                    <div className="h-16 shrink-0 border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 bg-white z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/invoices')} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-base font-bold text-slate-900 tracking-tight">
                                {isEditMode ? 'Edit Invoice' : 'New Invoice'}
                                {isDirty && <span className="ml-2 text-xs font-normal text-slate-400">Unsaved changes</span>}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="secondary" onClick={() => saveInvoice(true, false)} className="shadow-none px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">
                                Save Draft
                            </Button>
                            <Button variant="secondary" onClick={generatePDF} disabled={isGenerating || isSending} className="shadow-none px-3 py-1.5 text-xs">
                                <Download size={14} className="mr-1.5" /> PDF
                            </Button>
                            <Button variant="primary" onClick={() => setIsMessageModalOpen(true)} disabled={isGenerating || isSending} className="shadow-none px-4 py-1.5 text-xs bg-brand-base hover:bg-brand-hover">
                                <Send size={14} className="mr-1.5" /> Send
                            </Button>
                        </div>
                    </div>

                    {/* Form Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12 pb-32">
                        
                        {/* Section 1: Identity */}
                        <div>
                            <SectionHeader title="Document Identity" />
                            <div className="flex gap-8 items-start mb-4">
                                <div className="flex-1 space-y-1">
                                    <InputLine label="Invoice No" value={invoice.invoiceNumber} onChange={(e) => updateInvoice('invoiceNumber', e.target.value)} placeholder="INV-001" />
                                    <InputLine label="Issue Date" type="date" value={invoice.issueDate} onChange={(e) => updateInvoice('issueDate', e.target.value)} />
                                    <InputLine label="Due Date" type="date" value={invoice.dueDate} onChange={(e) => updateInvoice('dueDate', e.target.value)} />
                                    
                                    <div className="flex items-center gap-4 py-1.5 border-b border-slate-200 group w-full">
                                        <label className="text-xs font-semibold text-slate-500 w-28 shrink-0 tracking-tight">Currency</label>
                                        <select
                                            className="bg-transparent text-sm text-slate-900 focus:outline-none w-full cursor-pointer"
                                            value={invoice.currency}
                                            onChange={(e) => updateInvoice('currency', e.target.value)}
                                        >
                                            {currencies.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {logoPreview ? (
                                        <div className="relative group/logo">
                                            <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain border border-slate-200 rounded-none bg-white p-2" />
                                            <button
                                                onClick={() => { setLogoPreview(''); updateNestedInvoice('sender', 'logo', ''); }}
                                                className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 rounded-none p-1 opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center w-24 h-24 border border-dashed border-slate-300 rounded-none cursor-pointer hover:bg-slate-50 transition-colors text-slate-400">
                                            <Upload className="w-4 h-4 mb-2" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase">Logo</span>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Parties */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <SectionHeader title="From (Sender)" />
                                <div className="space-y-1">
                                    <InputLine label="Company" value={invoice.sender.companyName} onChange={e => updateNestedInvoice('sender', 'companyName', e.target.value)} placeholder="Your Company" />
                                    <InputLine label="Name" value={invoice.sender.name} onChange={e => updateNestedInvoice('sender', 'name', e.target.value)} placeholder="Your Name" />
                                    <InputLine label="Email" type="email" value={invoice.sender.email} onChange={e => updateNestedInvoice('sender', 'email', e.target.value)} placeholder="you@company.com" />
                                    <TextareaLine label="Address" value={invoice.sender.address} onChange={e => updateNestedInvoice('sender', 'address', e.target.value)} placeholder="123 Street..." />
                                </div>
                            </div>
                            <div className="relative">
                                <SectionHeader title="Billed To (Client)" />
                                <div className="space-y-1 relative">
                                    <div className="relative">
                                        <InputLine 
                                            label="Client" 
                                            value={invoice.client.name} 
                                            onChange={e => {
                                                updateNestedInvoice('client', 'name', e.target.value);
                                                setShowClientDropdown(true);
                                            }}
                                            onFocus={() => setShowClientDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                            placeholder="Client Name or Company" 
                                        />
                                        
                                        <AnimatePresence>
                                            {showClientDropdown && invoice.client.name && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                    className="absolute top-full left-[128px] right-0 mt-1 bg-white border border-slate-200 shadow-xl max-h-48 overflow-y-auto z-50 rounded-none"
                                                >
                                                    {clients.filter(c => c.name.toLowerCase().includes(invoice.client.name.toLowerCase()) || (c.companyName && c.companyName.toLowerCase().includes(invoice.client.name.toLowerCase())) || (c.email && c.email.toLowerCase().includes(invoice.client.name.toLowerCase()))).length > 0 ? (
                                                        clients.filter(c => c.name.toLowerCase().includes(invoice.client.name.toLowerCase()) || (c.companyName && c.companyName.toLowerCase().includes(invoice.client.name.toLowerCase())) || (c.email && c.email.toLowerCase().includes(invoice.client.name.toLowerCase()))).map(client => (
                                                            <div 
                                                                key={client._id} 
                                                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                                                                onClick={() => {
                                                                    updateNestedInvoice('client', 'name', client.name);
                                                                    updateNestedInvoice('client', 'email', client.email || '');
                                                                    updateNestedInvoice('client', 'address', client.address || '');
                                                                    setShowClientDropdown(false);
                                                                }}
                                                            >
                                                                <div className="text-sm font-bold text-slate-900 tracking-tight">{client.companyName ? `${client.name} (${client.companyName})` : client.name}</div>
                                                                <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{client.email}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-xs text-slate-500 italic flex items-center justify-between">
                                                            <span>No existing match found.</span>
                                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 font-bold uppercase tracking-widest border border-emerald-100">Will be saved natively</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <InputLine label="Email" type="email" value={invoice.client.email} onChange={e => updateNestedInvoice('client', 'email', e.target.value)} placeholder="client@company.com" />
                                    <TextareaLine label="Address" value={invoice.client.address} onChange={e => updateNestedInvoice('client', 'address', e.target.value)} placeholder="456 Avenue..." />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Line Items */}
                        <div>
                            <SectionHeader title="Line Items" />
                            <div className="flex gap-4 pb-2 border-b border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                <div className="flex-1">Description</div>
                                <div className="w-16 text-center">Qty</div>
                                <div className="w-24 text-right">Rate</div>
                                <div className="w-24 text-right">Amount</div>
                                <div className="w-6"></div>
                            </div>
                            <div className="space-y-2">
                                {invoice.items.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center group">
                                        <div className="flex-1 relative">
                                            <input 
                                                placeholder="Service description..." 
                                                className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-300 py-1.5 border-b border-transparent focus:border-brand-base transition-colors" 
                                                value={item.description} 
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)} 
                                                onFocus={() => setActiveServiceIdx(index)}
                                                onBlur={() => setTimeout(() => setActiveServiceIdx(-1), 200)}
                                            />
                                            {activeServiceIdx === index && item.description && savedServices.length > 0 && (
                                                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 shadow-lg z-30 max-h-40 overflow-y-auto">
                                                    {savedServices
                                                        .filter(s => s.name.toLowerCase().includes(item.description.toLowerCase()))
                                                        .slice(0, 5)
                                                        .map(s => (
                                                            <div
                                                                key={s._id}
                                                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    handleItemChange(index, 'description', s.name);
                                                                    handleItemChange(index, 'rate', s.price);
                                                                    setActiveServiceIdx(-1);
                                                                }}
                                                            >
                                                                <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                                                                <div className="text-[10px] text-slate-400 flex justify-between">
                                                                    <span>{s.description}</span>
                                                                    <span className="font-bold">{currencySymbol}{Number(s.price).toFixed(2)}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-16">
                                            <input 
                                                type="number" min="1" 
                                                className="w-full bg-transparent text-sm text-center focus:outline-none py-1.5 border-b border-transparent focus:border-brand-base transition-colors" 
                                                value={item.quantity} 
                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} 
                                            />
                                        </div>
                                        <div className="w-24 relative">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{currencySymbol}</span>
                                            <input 
                                                type="number" min="0" step="0.01" 
                                                className="w-full bg-transparent text-sm text-right focus:outline-none pl-6 py-1.5 border-b border-transparent focus:border-brand-base transition-colors" 
                                                value={item.rate} 
                                                onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))} 
                                            />
                                        </div>
                                        <div className="w-24 text-right text-sm font-semibold text-slate-900">
                                            {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                                        </div>
                                        <button onClick={() => removeItem(index)} className="w-6 h-6 flex justify-center items-center text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <button onClick={addItem} className="text-xs font-bold tracking-widest uppercase text-brand-base flex items-center gap-1 hover:text-brand-hover transition-colors">
                                    <Plus className="w-4 h-4" /> Add Line Item
                                </button>
                                {invoice.items.some(i => i.description && i.rate > 0) && (
                                    <button
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
                                        className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-1 hover:text-brand-base transition-colors"
                                    >
                                        <BookmarkPlus className="w-4 h-4" /> Save as Service
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Section 4: Totals & Payments */}
                        <div className="grid grid-cols-2 gap-12 pt-8">
                            <div>
                                <SectionHeader title="Payment Options" />
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 tracking-tight mb-2 flex justify-between">
                                            Payment Details
                                        </label>
                                        <input placeholder="Bank: XYZ, Acct: 1234..." className="w-full text-sm border-b border-slate-200 py-1.5 focus:outline-none focus:border-brand-base placeholder:text-slate-300 bg-transparent" value={invoice.paymentQr} onChange={(e) => updateInvoice('paymentQr', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 tracking-tight mb-2">Additional Notes</label>
                                        <textarea placeholder="Thank you for your business!" className="w-full text-sm border-b border-slate-200 py-1.5 focus:outline-none focus:border-brand-base placeholder:text-slate-300 resize-none min-h-[60px] bg-transparent" value={invoice.notes} onChange={(e) => updateInvoice('notes', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 tracking-tight mb-3">Payment QR Code (Optional)</label>
                                        {qrPreview ? (
                                            <div className="relative inline-block group/qr">
                                                <img src={qrPreview} alt="QR Code" className="w-20 h-20 object-contain border border-slate-200 bg-white p-2" />
                                                <button onClick={() => { setQrPreview(''); updateInvoice('qrCodeImage', ''); }} className="absolute -top-2 -right-2 bg-white border border-slate-200 text-red-500 p-1 opacity-0 group-hover/qr:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors text-slate-400 w-fit">
                                                <Plus className="w-4 h-4" />
                                                <span className="text-[10px] font-bold tracking-widest uppercase">Attach QR</span>
                                                <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-8">
                                <SectionHeader title="Summary" />
                                <div className="space-y-4 mt-6">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500 tracking-tight font-medium">Subtotal</span>
                                        <span className="font-semibold text-slate-900">{currencySymbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <input
                                                type="text"
                                                className="w-16 bg-transparent border-b border-slate-300 text-sm focus:outline-none text-slate-900 font-medium tracking-tight"
                                                value={invoice.taxName}
                                                onChange={(e) => updateInvoice('taxName', e.target.value)}
                                                placeholder="Tax"
                                            />
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    className="w-12 bg-transparent border-b border-slate-300 text-sm focus:outline-none text-right font-medium text-slate-900 mr-1"
                                                    value={invoice.taxPercentage}
                                                    onChange={(e) => updateInvoice('taxPercentage', Number(e.target.value))}
                                                />
                                                <span className="text-xs">%</span>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-slate-900">{currencySymbol}{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center pb-4 border-b border-slate-200">
                                        <span className="text-slate-500 tracking-tight font-medium">Discount</span>
                                        <div className="flex items-center text-brand-base">
                                            <span className="text-sm font-semibold mr-1">- {currencySymbol}</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-transparent border-b border-slate-300 focus:border-brand-base text-sm focus:outline-none text-right font-semibold"
                                                value={invoice.discount}
                                                onChange={(e) => updateInvoice('discount', Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-bold pt-2 text-slate-900 tracking-tight">
                                        <span>Total</span>
                                        <span>{currencySymbol}{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE: LIVE PREVIEW */}
                <div className={`md:w-1/2 w-full flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 relative ${mobileTab !== 'preview' ? 'hidden md:flex' : ''}`}>
                    <div className="w-full max-w-[800px] h-full">
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

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-none shadow-xl border ${toast.type === 'error' ? 'bg-white border-red-500 text-red-600' : 'bg-slate-900 border-slate-900 text-white'} flex items-center gap-2 z-[100]`}
                    >
                        {toast.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} className="text-emerald-400" />}
                        <span className="font-semibold text-xs tracking-widest uppercase">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Message Modal */}
            <AnimatePresence>
                {isMessageModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white max-w-lg w-full rounded-none shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
                        >
                            <div className="px-6 py-4 border-b border-slate-200">
                                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Send Invoice #{invoice.invoiceNumber}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-xs text-slate-500">
                                    This will generate a final PDF, create a secure public link, and email it directly to <strong>{invoice.client.email || 'the client'}</strong>.
                                </p>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Optional Message</label>
                                    <textarea 
                                        className="w-full border py-2 px-3 focus:outline-none border-slate-200 focus:border-brand-base text-sm resize-none min-h-[100px]"
                                        placeholder="Hi there, thanks for your business! Here is the invoice..."
                                        value={customMessage}
                                        onChange={e => setCustomMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => setIsMessageModalOpen(false)} disabled={isSending} className="shadow-none text-xs px-4 py-2 bg-white">
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleSend} disabled={isSending || !invoice.client.email} className="shadow-none bg-brand-base hover:bg-brand-hover text-xs px-6 py-2">
                                    {isSending ? 'Sending...' : 'Send Now'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InvoiceBuilder;
