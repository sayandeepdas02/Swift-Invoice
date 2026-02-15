import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Download, Check, Save, Zap, AlertCircle, Upload, Image, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const invoiceId = searchParams.get('edit');
    const isEditMode = !!invoiceId;

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    ];

    const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || invoice.currency;

    // Load invoice for editing or pre-fill sender details
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

    // File upload handler for logo
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setLogoPreview(base64String);
                setInvoice({ ...invoice, sender: { ...invoice.sender, logo: base64String } });
            };
            reader.readAsDataURL(file);
        }
    };

    // File upload handler for QR code
    const handleQrUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setQrPreview(base64String);
                setInvoice({ ...invoice, qrCodeImage: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-calculate amounts
    useEffect(() => {
        const updatedItems = invoice.items.map(item => ({
            ...item,
            amount: item.quantity * item.rate
        }));

        // Only update if something changed to avoid infinite loop
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
        setInvoice({ ...invoice, items: newItems });
    };

    const addItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) return;
        const newItems = invoice.items.filter((_, i) => i !== index);
        setInvoice({ ...invoice, items: newItems });
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
            // Trigger download
            const pdfResponse = await api.get(`/invoices/${savedInvoice._id}/download`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `INV-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showToast('Invoice downloaded successfully!');
            if (!isEditMode) navigate('/invoices'); // Redirect to history after create & download
        } catch (error) {
            showToast('Error generating invoice', 'error');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            {isEditMode && (
                                <button onClick={() => navigate('/invoices')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            )}
                            <h1 className="text-4xl font-black tracking-tight italic uppercase">
                                {isEditMode ? 'Edit Invoice' : 'Invoice Builder'}
                            </h1>
                        </div>
                        <p className="text-zinc-500">{isEditMode ? 'Update your invoice details below.' : 'Create professional invoices in seconds.'}</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => saveInvoice(true)}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-6 py-4 font-bold text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-xl transition-all"
                        >
                            <Save className="w-5 h-5" /> Save Draft
                        </button>
                        <button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-soft"
                        >
                            {isGenerating ? 'Processing...' : <><Download className="w-5 h-5" /> {isEditMode ? 'Update & Download' : 'Download Invoice'}</>}
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2.5rem] shadow-sm overflow-hidden p-10 md:p-16">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
                        <div className="flex-1">
                            {/* Logo Upload Section */}
                            <div className="mb-6">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-3">Company Logo (Optional)</label>
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <div className="relative">
                                            <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain border-2 border-zinc-200 rounded-xl p-2" />
                                            <button
                                                onClick={() => {
                                                    setLogoPreview('');
                                                    setInvoice({ ...invoice, sender: { ...invoice.sender, logo: '' } });
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-soft transition-all">
                                            <Upload className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm font-semibold text-zinc-600">Upload Logo</span>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Company Name Input */}
                            <div className="space-y-4 max-w-sm mb-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-2">Company Name</label>
                                    <input
                                        placeholder="Your Company Name"
                                        value={invoice.sender.companyName}
                                        onChange={(e) => setInvoice({ ...invoice, sender: { ...invoice.sender, companyName: e.target.value } })}
                                        className="text-xl font-black w-full border-none p-0 focus:ring-0 placeholder:text-zinc-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 max-w-sm">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-2">Invoice #</label>
                                    <input
                                        value={invoice.invoiceNumber}
                                        onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                                        className="text-2xl font-black w-full border-none p-0 focus:ring-0 placeholder:text-zinc-200"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-2">Issue Date</label>
                                <input
                                    type="date"
                                    value={invoice.issueDate}
                                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                                    className="input-field py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    value={invoice.dueDate}
                                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                                    className="input-field py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 mb-16">
                        {/* Sender */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-2">Pay To (Sender)</h3>
                            <div className="space-y-4">
                                <input
                                    placeholder="Your Business Name"
                                    className="input-field font-bold"
                                    value={invoice.sender.name}
                                    onChange={(e) => setInvoice({ ...invoice, sender: { ...invoice.sender, name: e.target.value } })}
                                />
                                <input
                                    placeholder="Email"
                                    className="input-field"
                                    value={invoice.sender.email}
                                    onChange={(e) => setInvoice({ ...invoice, sender: { ...invoice.sender, email: e.target.value } })}
                                />
                                <textarea
                                    placeholder="Full Address"
                                    className="input-field min-h-[100px] resize-none"
                                    value={invoice.sender.address}
                                    onChange={(e) => setInvoice({ ...invoice, sender: { ...invoice.sender, address: e.target.value } })}
                                />
                            </div>
                        </div>

                        {/* Client */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-2">Billed To (Client)</h3>
                            <div className="space-y-4">
                                <input
                                    placeholder="Client Business Name"
                                    className="input-field font-bold"
                                    value={invoice.client.name}
                                    onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, name: e.target.value } })}
                                />
                                <input
                                    placeholder="Client Email"
                                    className="input-field"
                                    value={invoice.client.email}
                                    onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, email: e.target.value } })}
                                />
                                <textarea
                                    placeholder="Client Address"
                                    className="input-field min-h-[100px] resize-none"
                                    value={invoice.client.address}
                                    onChange={(e) => setInvoice({ ...invoice, client: { ...invoice.client, address: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-12">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-100 pb-2">Description of Services / Products</h3>
                        <div className="space-y-4">
                            {invoice.items.map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center group">
                                    <div className="flex-grow w-full">
                                        <input
                                            placeholder="Service or item description"
                                            className="input-field font-medium"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24 shrink-0">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Qty"
                                            className="input-field text-center"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-32 shrink-0">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Rate"
                                            className="input-field text-right"
                                            value={item.rate}
                                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-32 shrink-0 text-right pr-4 font-bold text-lg">
                                        {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addItem}
                            className="mt-6 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-black transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    {/* Bottom Grid: QR & Totals */}
                    <div className="grid md:grid-cols-2 gap-16 pt-12 border-t border-zinc-100">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Payment Options</h3>
                            <div className="space-y-6">
                                {/* QR Code Upload */}
                                <div>
                                    <label className="block text-xs font-bold mb-3">Payment QR Code (Optional)</label>
                                    {qrPreview ? (
                                        <div className="relative inline-block">
                                            <img src={qrPreview} alt="QR Code" className="w-32 h-32 object-contain border-2 border-zinc-200 rounded-xl p-2" />
                                            <button
                                                onClick={() => {
                                                    setQrPreview('');
                                                    setInvoice({ ...invoice, qrCodeImage: '' });
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary-soft transition-all w-fit">
                                            <Image className="w-4 h-4 text-zinc-500" />
                                            <span className="text-sm font-semibold text-zinc-600">Upload QR Code</span>
                                            <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                                        </label>
                                    )}
                                    <p className="text-[10px] text-zinc-400 mt-2 italic">Upload your GPay/PhonePe/Paytm QR code image</p>
                                </div>

                                {/* UPI ID Input */}
                                <div>
                                    <label className="block text-xs font-bold mb-2">UPI ID (Optional)</label>
                                    <input
                                        placeholder="e.g. yourname@okaxis"
                                        className="input-field"
                                        value={invoice.paymentQr}
                                        onChange={(e) => setInvoice({ ...invoice, paymentQr: e.target.value })}
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-2 italic">This will be displayed as text in your invoice</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold mb-2">Additional Notes</label>
                                    <textarea
                                        placeholder="Bank details, terms, etc."
                                        className="input-field min-h-[100px] resize-none text-sm"
                                        value={invoice.notes}
                                        onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-50/50 p-8 rounded-[2rem] space-y-4">
                            <div className="flex justify-between text-zinc-500 font-medium">
                                <span>Subtotal</span>
                                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500 font-medium pb-4 border-b border-zinc-200">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="w-16 bg-transparent border-none p-0 focus:ring-0 text-right font-medium placeholder:text-zinc-300"
                                        value={invoice.taxName}
                                        onChange={(e) => setInvoice({ ...invoice, taxName: e.target.value })}
                                        placeholder="Tax"
                                    />
                                    <input
                                        type="number"
                                        className="w-12 bg-transparent border-none p-0 focus:ring-0 font-bold text-center underline decoration-primary decoration-2 underline-offset-4"
                                        value={invoice.taxPercentage}
                                        onChange={(e) => setInvoice({ ...invoice, taxPercentage: Number(e.target.value) })}
                                    />
                                    <span>%</span>
                                </div>
                                <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500 font-medium pb-4 border-b border-zinc-200">
                                <span>Discount</span>
                                <div className="flex items-center gap-1">
                                    <span>- {currencySymbol}</span>
                                    <input
                                        type="number"
                                        className="w-20 bg-transparent border-none p-0 focus:ring-0 font-bold text-right underline decoration-zinc-300 decoration-2 underline-offset-4"
                                        value={invoice.discount}
                                        onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-2xl font-black pt-2">
                                <span>Total Amount</span>
                                <span className="text-secondary tracking-tighter">{currencySymbol}{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="pt-6">
                                <select
                                    className="bg-transparent text-xs font-black uppercase tracking-widest border border-zinc-200 rounded-lg px-2 py-1"
                                    value={invoice.currency}
                                    onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                                >
                                    {currencies.map(currency => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer info */}
                <p className="text-center text-zinc-400 text-xs mt-12 pb-20">
                    * This invoice is subject to your terms and conditions. Swift Invoice does not store your private data.
                </p>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-black text-white'
                            }`}
                    >
                        {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5 text-primary" />}
                        <span className="font-bold text-sm tracking-tight">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
