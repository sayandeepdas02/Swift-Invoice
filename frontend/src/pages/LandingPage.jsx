import React from 'react';
import { motion } from 'framer-motion';
import { Zap, FileText, Upload, Calculator, QrCode, Globe, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

const LandingPage = () => {
    const handleSampleInvoice = async () => {
        const toastId = toast.loading('Generating sample...');
        try {
            const sampleData = {
                invoiceNumber: 'SAMPLE-001',
                sender: { name: 'Acme Corp', address: '123 Business Rd', email: 'contact@acme.com' },
                client: { name: 'John Doe', address: '456 Client St', email: 'john@example.com' },
                items: [{ description: 'Web Development Services', quantity: 1, rate: 500, amount: 500 }],
                subtotal: 500,
                taxPercentage: 10,
                taxAmount: 50,
                totalAmount: 550,
                currency: 'USD',
                date: new Date().toISOString(),
                dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
                isDraft: false
            };

            const response = await api.post('/invoices', sampleData);
            const invoiceId = response.data._id;

            const pdfResponse = await api.get(`/invoices/${invoiceId}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'INV-SAMPLE.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Sample invoice downloaded!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate sample', { id: toastId });
        }
    };

    const features = [
        { icon: <Zap />, title: "Instant Generation", desc: "Create professional invoices in under 60 seconds." },
        { icon: <FileText />, title: "PDF Export", desc: "Clean, print-ready PDF invoices for your clients." },
        { icon: <Calculator />, title: "Tax & Discounts", desc: "Automatic calculations for taxes and discounts." },
        { icon: <Upload />, title: "Custom Logo", desc: "Personalize every invoice with your brand identity." },
        { icon: <QrCode />, title: "QR Payments", desc: "Integrated payment QR codes for faster payouts." },
        { icon: <Globe />, title: "Multi-currency", desc: "Support for global businesses and currencies." },
    ];

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block bg-primary-soft text-secondary font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6 italic border border-primary/20">
                            The fastest way to get paid
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tighter">
                            Create & Send <br /> <span className="text-primary italic">Invoices</span> in Seconds
                        </h1>
                        <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Simple. Fast. Professional invoicing for freelancers, founders & startups. No complex accounting, just beautiful invoices.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/dashboard" className="btn-secondary px-10 py-4 text-lg flex items-center gap-2">
                                Generate Invoice <ArrowRight className="w-5 h-5" />
                            </Link>
                            <button
                                onClick={handleSampleInvoice}
                                className="px-8 py-4 text-zinc-600 font-semibold hover:text-black transition-colors"
                            >
                                View Sample Invoice
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-soft/50 rounded-full blur-[120px] -z-10" />
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-zinc-50/50 border-y border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tight mb-4">Everything you need</h2>
                        <p className="text-zinc-500">Fast, simple, and beautiful invoice generator.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
                            >
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 text-white">
                                    {React.cloneElement(feature.icon, { size: 24 })}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tight mb-4">Simple Pricing</h2>
                        <p className="text-zinc-500">No credit card required. Free forever.</p>
                    </div>

                    <div className="max-w-md mx-auto">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-zinc-200 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black mb-2">Free</h3>
                                <div className="text-5xl font-black tracking-tighter mb-2">$0</div>
                                <p className="text-zinc-400 text-sm">Forever. For everyone.</p>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {[
                                    "Unlimited Invoices",
                                    "Unlimited Clients",
                                    "PDF Exports",
                                    "Custom Branding",
                                    "Multi-currency Support",
                                    "Payment QR Codes"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-zinc-600 font-medium">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-primary-dark" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/signup" className="btn-primary w-full block text-center py-4 text-lg">
                                Get Started for Free
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tight mb-4">Loved by freelancers & founders</h2>
                        <p className="text-zinc-500">See what our users have to say about Swift Invoice.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-primary text-xl">★</span>
                                ))}
                            </div>
                            <p className="text-zinc-700 mb-6 leading-relaxed">
                                "Swift Invoice saved me hours every week. I can now create professional invoices in seconds and get paid faster. Absolutely love it!"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-white">
                                    SM
                                </div>
                                <div>
                                    <div className="font-bold">Sarah Mitchell</div>
                                    <div className="text-sm text-zinc-500">Freelance Designer</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-primary text-xl">★</span>
                                ))}
                            </div>
                            <p className="text-zinc-700 mb-6 leading-relaxed">
                                "The QR code payment feature is a game-changer. My clients can pay instantly, and I don't have to chase payments anymore."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-white">
                                    RP
                                </div>
                                <div>
                                    <div className="font-bold">Raj Patel</div>
                                    <div className="text-sm text-zinc-500">Startup Founder</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:border-primary/20"
                        >
                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className="text-primary text-xl">★</span>
                                ))}
                            </div>
                            <p className="text-zinc-700 mb-6 leading-relaxed">
                                "Clean, simple, and exactly what I needed. No bloated features, just beautiful invoices that make my business look professional."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-white">
                                    EJ
                                </div>
                                <div>
                                    <div className="font-bold">Emily Johnson</div>
                                    <div className="text-sm text-zinc-500">Consultant</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview / CTA */}
            <section className="py-32">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="bg-black text-white p-12 md:p-20 rounded-[3rem] relative overflow-hidden">
                        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10 leading-tight">
                            Ready to create your <br /> next invoice?
                        </h2>
                        <Link to="/dashboard" className="btn-primary relative z-10 px-10 py-5 text-xl font-black">
                            Start Creating Now — It's Free
                        </Link>
                        {/* Logo Watermark */}
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 text-white/5 -z-0 rotate-12" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Zap className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">Swift Invoice</span>
                    </div>
                    <div className="text-zinc-400 text-sm">
                        © 2026 Swift Invoice. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-zinc-500">
                        <a href="https://twitter.com" className="hover:text-black">Twitter</a>
                        <a href="/privacy" className="hover:text-black">Privacy</a>
                        <a href="/terms" className="hover:text-black">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
