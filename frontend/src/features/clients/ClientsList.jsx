import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, User, FileText, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoiceApi } from '../../services/api/invoiceApi';
import { clientApi } from '../../services/api/clientApi';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

// Mock simple Drawer for Address Book to satisfy the "Create/Edit Client" requirement
// Since clients are embedded in invoices, we'll store user-created clients in localStorage
// and merge them with invoice-derived clients for display.
const ClientDrawer = ({ client, onClose, onSave }) => {
    const [formData, setFormData] = useState(client || { name: '', email: '', address: '' });
    const [history, setHistory] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // details or history
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (client?._id && activeTab === 'history' && !history) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const data = await clientApi.getHistory(client._id);
                    setHistory(data);
                } catch (error) {
                    toast.error('Failed to load client history');
                } finally {
                    setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [client, activeTab, history]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end" onClick={onClose}>
                <motion.div
                    className="h-full bg-white flex flex-col z-50 shadow-2xl border-l border-slate-200 w-full md:w-[400px]"
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    onClick={e => e.stopPropagation()}
                >
                >
                    <div className="flex flex-col border-b border-slate-200 shrink-0">
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">{client ? 'Client Details' : 'New Client'}</h2>
                            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        {client && (
                            <div className="flex gap-6 px-6">
                                <button onClick={() => setActiveTab('details')} className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-colors ${activeTab === 'details' ? 'border-brand-base text-brand-base' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>Edit Profile</button>
                                <button onClick={() => setActiveTab('history')} className={`pb-3 text-sm font-bold tracking-tight border-b-2 transition-colors ${activeTab === 'history' ? 'border-brand-base text-brand-base' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>History & Invoices</button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'details' || !client ? (
                        <>
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Company / Name</label>
                                <input required name="name" value={formData.name} onChange={handleChange} placeholder="Acme Corp" className="w-full border-b border-slate-200 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 tracking-tight placeholder:text-slate-300 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="billing@acme.com" className="w-full border-b border-slate-200 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 tracking-tight placeholder:text-slate-300 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="123 Standard Way..." className="w-full border-b border-slate-200 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 tracking-tight placeholder:text-slate-300 transition-colors min-h-[80px] resize-none" />
                            </div>
                        </div>
                            </form>

                            <div className="p-4 border-t border-slate-200 shrink-0 flex gap-2">
                                <Button variant="secondary" onClick={onClose} className="flex-1 shadow-none tracking-tight">Cancel</Button>
                                <Button variant="primary" onClick={handleSubmit} className="flex-1 shadow-none bg-brand-base hover:bg-brand-hover border-none tracking-tight">Save Client</Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-sm">
                            {loadingHistory ? (
                                <div className="text-slate-500 text-center py-10 font-medium animate-pulse">Loading history...</div>
                            ) : history ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white border border-slate-200 p-4">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Revenue</div>
                                            <div className="text-xl font-black text-emerald-600">${history.summary.totalRevenue.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-4">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Overdue</div>
                                            <div className="text-xl font-black text-red-600">${history.summary.overdueAmount.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-3 tracking-tight">All Invoices ({history.summary.invoiceCount})</h3>
                                        {history.invoices.length === 0 ? (
                                            <div className="text-slate-500 text-xs">No invoices found for this client.</div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {history.invoices.map((inv, idx) => (
                                                    <li key={idx} className="bg-white border border-slate-200 p-3 flex justify-between items-center group hover:border-brand-base transition-colors cursor-pointer" onClick={() => window.location.href = `/invoices/edit/${inv._id}`}>
                                                        <div>
                                                            <div className="font-bold text-slate-900 leading-none mb-1">{inv.invoiceNumber}</div>
                                                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{inv.status}</div>
                                                        </div>
                                                        <div className="font-bold text-slate-900">${(inv.totalAmount || 0).toFixed(2)}</div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ClientsList = () => {
    const [clients, setClients] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invData, clientData] = await Promise.all([
                    invoiceApi.getAll(),
                    clientApi.getAll()
                ]);
                setInvoices(invData);
                setClients(clientData);
            } catch (error) {
                toast.error('Failed to load client data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const clientsAggregated = useMemo(() => {
        const map = new Map();
        
        // Base seed from backend
        clients.forEach(c => {
            map.set(c._id.toString(), { ...c, totalInvoices: 0, totalRevenue: 0 });
        });

        // Overlay with live invoice data for totals
        invoices.forEach(inv => {
            if (!inv.client || (!inv.client.name && !inv.client.email)) return;
            const targetEmail = inv.client.email?.toLowerCase();
            
            let matchedClient = clients.find(c => c.email.toLowerCase() === targetEmail);
            
            if (matchedClient) {
                const record = map.get(matchedClient._id.toString());
                record.totalInvoices += 1;
                if (inv.status === 'paid' || inv.status === 'Paid') {
                    record.totalRevenue += (inv.totalAmount || 0);
                }
                map.set(matchedClient._id.toString(), record);
            }
        });

        return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [invoices, clients]);

    const filteredClients = clientsAggregated.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveClient = async (clientData) => {
        try {
            if (clientData._id) {
                await clientApi.update(clientData._id, clientData);
                setClients(prev => prev.map(c => c._id === clientData._id ? {...c, ...clientData} : c));
                toast.success('Client updated successfully');
            } else {
                const newClient = await clientApi.create(clientData);
                setClients(prev => [...prev, newClient]);
                toast.success('Client saved successfully');
            }
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save client');
        }
    };

    if (loading) {
        return (
            <div className="p-8 space-y-6">
                <div className="w-48 h-8 bg-slate-200 animate-pulse mb-8" />
                <div className="h-96 bg-slate-200 animate-pulse border border-slate-100" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Clients</h1>
                    <p className="text-slate-500 text-sm font-medium tracking-tight">Your client directory and lifetime revenue overview.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        variant="primary" 
                        onClick={() => { setSelectedClient(null); setIsDrawerOpen(true); }}
                        className="py-2 text-sm shadow-none bg-brand-base hover:bg-brand-hover rounded-none tracking-tight border-none"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Client
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center justify-between border-b border-slate-200 pb-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        placeholder="Search clients..."
                        className="w-full pl-9 py-2 bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-base focus:ring-1 focus:ring-brand-base rounded-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Client List */}
            <div className="bg-white border border-slate-200">
                {filteredClients.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-50 flex items-center justify-center mb-4">
                            <User size={20} className="text-slate-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">No clients found</h3>
                        <p className="text-xs text-slate-500 mb-4 tracking-tight">Add a client manually or generate your first invoice.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4 text-center w-32">Invoices</th>
                                    <th className="px-6 py-4 text-right w-48">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {filteredClients.map((client, i) => (
                                    <tr 
                                        key={i} 
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => { setSelectedClient(client); setIsDrawerOpen(true); }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {(client.name || client.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold tracking-tight text-slate-900">{client.name || 'Unnamed Client'}</div>
                                                    <div className="text-xs text-slate-500">{client.email || 'No email provided'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-none border border-slate-200">
                                                <FileText size={12} /> {client.totalInvoices}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold tracking-tight text-slate-900">
                                            <div className="flex items-center justify-end gap-1 text-emerald-600">
                                                {client.totalRevenue > 0 ? (
                                                    <><TrendingUp size={14} className="opacity-50" /> ${client.totalRevenue.toFixed(2)}</>
                                                ) : (
                                                    <span className="text-slate-400">$0.00</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isDrawerOpen && (
                <ClientDrawer 
                    client={selectedClient} 
                    onClose={() => setIsDrawerOpen(false)} 
                    onSave={handleSaveClient} 
                />
            )}
        </div>
    );
};

export default ClientsList;
