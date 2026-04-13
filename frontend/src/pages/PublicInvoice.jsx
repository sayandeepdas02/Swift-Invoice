import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, CreditCard, CheckCircle2, Share2, Copy, MessageCircle } from 'lucide-react';
import { invoiceApi } from '../services/api/invoiceApi';
import InvoiceTemplate from '../components/InvoiceTemplate';
import Button from '../components/ui/Button';

const PublicInvoice = () => {
    const { publicId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await invoiceApi.getPublic(publicId);
                setInvoice(data);
            } catch (err) {
                setError(err.message || 'Invoice not found or unavailable');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [publicId]);

    const handleDownload = async () => {
        if (!invoice || !invoice._id) return;
        setIsDownloading(true);
        try {
            // Note: Since this endpoint doesn't strictly check for user._id on backend for public/download?
            // Actually, backend downloadPdf requires protect. We might need a public download endpoint or just trigger a print command natively.
            // Let's implement print window or native browser PDF download via blob.
            // Since the user requested "Pay Now placeholder button" and "Download PDF button".
            // Since we don't have a public backend download endpoint, clicking download will trigger window.print()
            // which creates a perfect local PDF.
            window.print();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePayNow = () => {
        alert("Payment gateway integration (Stripe/Razorpay) coming soon!");
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Public link copied to clipboard!');
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(`Here is your invoice strictly processing via ${invoice.sender.companyName || invoice.sender.name}: ${window.location.href}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-base border-r-2 border-transparent"></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">!</span>
                </div>
                <h1 className="text-xl font-bold mb-2 text-center">Invoice Unavailable</h1>
                <p className="text-slate-500 text-center">{error}</p>
            </div>
        );
    }

    // Currencies object duplicating LivePreview's behavior
    const currencies = [
        { code: 'USD', symbol: '$' },
        { code: 'EUR', symbol: '€' },
        { code: 'GBP', symbol: '£' },
        { code: 'INR', symbol: '₹' },
        { code: 'AUD', symbol: 'A$' },
        { code: 'CAD', symbol: 'C$' },
        { code: 'SGD', symbol: 'S$' },
    ];
    const currencySymbol = currencies.find(c => c.code === invoice.currency)?.symbol || invoice.currency;

    const isPaid = invoice.status === 'paid' || invoice.status === 'Paid';

    return (
        <div className="min-h-screen bg-slate-100 print:bg-white text-slate-900 font-sans selection:bg-brand-base/20 print:p-0">
            {/* Top Action Bar - Hidden during print */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm print:hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-lg tracking-tight">Invoice #{invoice.invoiceNumber}</div>
                        {isPaid && (
                            <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-emerald-100 text-emerald-700">
                                PAID
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button 
                            variant="secondary" 
                            onClick={handleCopyLink} 
                            className="hidden sm:flex shadow-none border-slate-300 px-3 py-2 bg-white text-slate-600 hover:text-brand-base"
                            title="Copy Link"
                        >
                            <Copy size={16} /> 
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={handleWhatsApp} 
                            className="hidden sm:flex shadow-none border-slate-300 px-3 py-2 bg-white text-green-600 hover:bg-green-50"
                            title="Share via WhatsApp"
                        >
                            <MessageCircle size={16} /> 
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={handleDownload} 
                            disabled={isDownloading}
                            className="shadow-none border-slate-300 px-4 py-2 text-sm bg-white"
                        >
                            <Download size={16} className="mr-2 hidden sm:block" /> 
                            {isDownloading ? 'Processing...' : 'Download PDF'}
                        </Button>
                        {!isPaid && (
                            <Button 
                                variant="primary" 
                                onClick={handlePayNow}
                                className="shadow-none bg-brand-base hover:bg-brand-hover border-none px-6 py-2 text-sm font-semibold"
                            >
                                <CreditCard size={16} className="mr-2" /> Pay Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 print:max-w-none print:py-0 print:px-0">
                
                {/* Mobile View Summary Card (only shows on mobile, hidden on print) */}
                <div className="md:hidden bg-white border border-slate-200 p-6 mb-6 shadow-sm print:hidden flex flex-col gap-4">
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Amount Due</div>
                        <div className="text-3xl font-bold tracking-tight text-slate-900">
                            {currencySymbol}{Number(invoice.totalAmount).toFixed(2)}
                        </div>
                    </div>
                    {isPaid ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 border border-emerald-100">
                            <CheckCircle2 size={18} />
                            <span className="text-sm font-bold tracking-tight">Invoice Paid</span>
                        </div>
                    ) : (
                        <Button 
                            variant="primary" 
                            onClick={handlePayNow}
                            className="w-full shadow-none bg-brand-base hover:bg-brand-hover py-3 text-base"
                        >
                            <CreditCard size={18} className="mr-2" /> Pay {currencySymbol}{Number(invoice.totalAmount).toFixed(2)}
                        </Button>
                    )}
                </div>

                {/* Actual Invoice Rendering using existing template */}
                <div className="bg-white border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:w-full">
                    <InvoiceTemplate 
                        invoice={invoice}
                        subtotal={invoice.subtotal}
                        taxAmount={invoice.taxAmount}
                        totalAmount={invoice.totalAmount}
                        currencySymbol={currencySymbol}
                    />
                </div>
            </div>
            
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white;}
                }
            `}</style>
        </div>
    );
};

export default PublicInvoice;
