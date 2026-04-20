import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { settingsApi } from '../services/api/settingsApi';
import { uploadApi } from '../services/api/uploadApi';
import { authApi } from '../services/api/authApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Save, Building2, Palette, Sliders, Upload, Trash2, Users, Send } from 'lucide-react';

const Settings = () => {
    const { fetchUserProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    
    const [formData, setFormData] = useState({
        businessName: '',
        businessEmail: '',
        businessAddress: '',
        logoUrl: '',
        defaultCurrency: 'USD',
        invoicePrefix: 'INV'
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await settingsApi.get();
                setFormData({
                    businessName: data.businessName || '',
                    businessEmail: data.businessEmail || '',
                    businessAddress: data.businessAddress || '',
                    logoUrl: data.logoUrl || '',
                    defaultCurrency: data.defaultCurrency || 'USD',
                    invoicePrefix: data.invoicePrefix || 'INV'
                });
            } catch (err) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size must be less than 2MB');
                return;
            }
            
            const loadingToast = toast.loading('Uploading logo...');
            try {
                const url = await uploadApi.uploadImage(file);
                setFormData(prev => ({ ...prev, logoUrl: url }));
                toast.success('Logo uploaded successfully', { id: loadingToast });
            } catch (err) {
                toast.error(err.message || 'Failed to upload logo', { id: loadingToast });
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await settingsApi.update(formData);
            toast.success('Settings updated successfully');
            await fetchUserProfile(); // sync updated globals logically
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-6">
                <div className="w-48 h-8 bg-slate-200 animate-pulse mb-8" />
                <div className="h-96 bg-slate-200 animate-pulse border border-slate-100" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto pb-32">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">Settings</h1>
                <p className="text-slate-500 text-sm font-medium tracking-tight">Manage your core business identity and global application defaults.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* section: Business Information */}
                <section className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Business Information</h2>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Acme Inc."
                                    className="w-full border-b border-slate-300 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 placeholder:text-slate-300 transition-colors bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Business Email</label>
                                <input
                                    type="email"
                                    name="businessEmail"
                                    value={formData.businessEmail}
                                    onChange={handleChange}
                                    placeholder="billing@acme.com"
                                    className="w-full border-b border-slate-300 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 placeholder:text-slate-300 transition-colors bg-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Business Address</label>
                            <textarea
                                name="businessAddress"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                placeholder="123 Corporate Blvd, Suite 100&#10;San Francisco, CA 94103"
                                className="w-full border border-slate-300 p-3 focus:border-brand-base focus:outline-none text-sm text-slate-900 placeholder:text-slate-300 transition-colors bg-transparent resize-y min-h-[80px]"
                            />
                        </div>
                    </div>
                </section>

                {/* section: Branding */}
                <section className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Palette size={16} className="text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Brand Assets</h2>
                    </div>
                    <div className="p-6">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Company Logo</label>
                        <div className="flex items-start gap-6">
                            <div className="shrink-0">
                                {formData.logoUrl ? (
                                    <div className="relative group/logo">
                                        <div className="w-32 h-32 border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                                            <img src={formData.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                                            className="absolute -top-2 -right-2 bg-white border border-slate-200 shadow-sm text-red-500 rounded-none p-1.5 opacity-0 group-hover/logo:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-32 h-32 border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-slate-400">
                                        <Upload className="w-5 h-5 mb-2 text-slate-400" />
                                        <span className="text-[10px] font-bold tracking-widest uppercase">Upload Logo</span>
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                )}
                            </div>
                            <div className="text-sm text-slate-500">
                                <p className="mb-2">We recommend a transparent PNG or SVG logo for best resolution dynamically.</p>
                                <p className="text-xs">Max size: 2MB.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* section: Invoice Defaults */}
                <section className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Sliders size={16} className="text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Invoice Configuration</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Default Currency</label>
                            <div className="relative">
                                <select
                                    name="defaultCurrency"
                                    value={formData.defaultCurrency}
                                    onChange={handleChange}
                                    className="w-full border-b border-slate-300 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 bg-transparent cursor-pointer appearance-none pr-8"
                                >
                                    <option value="USD">USD — US Dollar</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="GBP">GBP — British Pound</option>
                                    <option value="INR">INR — Indian Rupee</option>
                                    <option value="AUD">AUD — Australian Dollar</option>
                                    <option value="CAD">CAD — Canadian Dollar</option>
                                    <option value="SGD">SGD — Singapore Dollar</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sequential Prefix</label>
                            <input
                                type="text"
                                name="invoicePrefix"
                                value={formData.invoicePrefix}
                                onChange={handleChange}
                                placeholder="INV"
                                className="w-full border-b border-slate-300 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 transition-colors bg-transparent uppercase"
                                maxLength={6}
                            />
                            <p className="text-xs text-slate-400 mt-2">Example: <strong>{formData.invoicePrefix}-0001</strong></p>
                        </div>
                    </div>
                </section>

                {/* section: Team Management */}
                <section className="bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Team Members</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-500">Invite teammates to your workspace. They'll share access to all invoices and clients.</p>
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full border-b border-slate-300 py-2 focus:border-brand-base focus:outline-none text-sm text-slate-900 placeholder:text-slate-300 transition-colors bg-transparent"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="primary"
                                disabled={inviting || !inviteEmail}
                                onClick={async () => {
                                    if (!inviteEmail) return;
                                    setInviting(true);
                                    try {
                                        await authApi.inviteTeamMember(inviteEmail);
                                        toast.success(`Invitation sent to ${inviteEmail}`);
                                        setInviteEmail('');
                                    } catch (err) {
                                        toast.error(err.message || 'Failed to send invitation');
                                    } finally {
                                        setInviting(false);
                                    }
                                }}
                                className="shadow-none bg-brand-base hover:bg-brand-hover border-none px-5 py-2 text-sm font-semibold tracking-tight whitespace-nowrap"
                            >
                                <Send size={14} className="mr-2" />
                                {inviting ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" disabled={saving} className="shadow-none bg-brand-base hover:bg-brand-hover border-none px-8 py-2.5 text-sm font-semibold tracking-tight">
                        <Save size={16} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
