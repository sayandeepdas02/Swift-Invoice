import React from 'react';

/**
 * InvoiceTemplate
 *
 * Pure presentational component — receives all invoice data as props
 * and renders a complete A4-styled invoice.
 *
 * This is the SINGLE SOURCE OF TRUTH for invoice layout.
 * Its visual output must remain pixel-consistent with backend/utils/pdfGenerator.js.
 * Update both files in sync whenever the template changes.
 */
const InvoiceTemplate = ({ invoice, subtotal, taxAmount, totalAmount, currencySymbol }) => {
    if (!invoice) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const fmt = (num) => Number(num || 0).toFixed(2);

    return (
        <div style={{
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            color: '#1a1a1a',
            padding: '40px',
            lineHeight: 1.5,
            fontSize: '14px',
            backgroundColor: '#ffffff',
            minHeight: '100%',
            boxSizing: 'border-box',
        }}>
            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                {/* Left: Logo + Company Name */}
                <div>
                    {invoice.sender?.logo && (
                        <img
                            src={invoice.sender.logo}
                            alt="Company Logo"
                            style={{ maxWidth: '140px', maxHeight: '72px', objectFit: 'contain', display: 'block', marginBottom: '10px' }}
                        />
                    )}
                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px' }}>
                        {invoice.sender?.companyName || 'SWIFT INVOICE'}
                    </h2>
                </div>

                {/* Right: Invoice title + meta */}
                <div style={{ textAlign: 'right' }}>
                    <h1 style={{ margin: '0 0 4px 0', fontWeight: 800, fontSize: '32px', letterSpacing: '-1px', color: '#000' }}>
                        INVOICE
                    </h1>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#555' }}>#{invoice.invoiceNumber}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#555' }}>Date: {formatDate(invoice.issueDate)}</p>
                    <p style={{ margin: '2px 0', fontSize: '13px', color: '#555' }}>Due: {formatDate(invoice.dueDate)}</p>
                </div>
            </div>

            {/* ── Billed To / Pay To ──────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>
                        Billed To
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{invoice.client?.name || <span style={{ color: '#ccc' }}>Client Name</span>}</div>
                    <div style={{ color: '#555', marginTop: '2px' }}>{invoice.client?.email}</div>
                    <div style={{ color: '#555', marginTop: '2px', whiteSpace: 'pre-line' }}>{invoice.client?.address}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>
                        Pay To
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{invoice.sender?.name || <span style={{ color: '#ccc' }}>Your Business Name</span>}</div>
                    <div style={{ color: '#555', marginTop: '2px' }}>{invoice.sender?.email}</div>
                    <div style={{ color: '#555', marginTop: '2px', whiteSpace: 'pre-line' }}>{invoice.sender?.address}</div>
                </div>
            </div>

            {/* ── Line Items Table ────────────────────────────────── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                        <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', fontWeight: 700 }}>Description</th>
                        <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', fontWeight: 700 }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', fontWeight: 700 }}>Rate</th>
                        <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em', fontWeight: 700 }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {(invoice.items || []).map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '11px 12px', color: item.description ? '#1a1a1a' : '#ccc' }}>
                                {item.description || 'Item description'}
                            </td>
                            <td style={{ padding: '11px 12px', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '11px 12px', textAlign: 'right' }}>{currencySymbol}{fmt(item.rate)}</td>
                            <td style={{ padding: '11px 12px', textAlign: 'right', fontWeight: 600 }}>{currencySymbol}{fmt(item.quantity * item.rate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ── Totals Block ────────────────────────────────────── */}
            <div style={{ marginLeft: 'auto', width: '260px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#555' }}>
                    <span>Subtotal</span>
                    <span>{currencySymbol}{fmt(subtotal)}</span>
                </div>

                {(invoice.taxPercentage > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#555' }}>
                        <span>{invoice.taxName || 'Tax'} ({invoice.taxPercentage}%)</span>
                        <span>{currencySymbol}{fmt(taxAmount)}</span>
                    </div>
                )}

                {(invoice.discount > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', color: '#555' }}>
                        <span>Discount</span>
                        <span>-{currencySymbol}{fmt(invoice.discount)}</span>
                    </div>
                )}

                <div style={{
                    display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                    borderTop: '2px solid #000', marginTop: '8px',
                    fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px'
                }}>
                    <span>Grand Total</span>
                    <span>{currencySymbol}{fmt(totalAmount)}</span>
                </div>
            </div>

            {/* ── Footer: Notes + QR ──────────────────────────────── */}
            <div style={{
                marginTop: '48px', paddingTop: '20px',
                borderTop: '1px solid #eee',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px'
            }}>
                <div style={{ maxWidth: '380px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>
                        Notes / Terms
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#555', whiteSpace: 'pre-line' }}>
                        {invoice.notes || 'Thank you for your business!'}
                    </p>
                    {invoice.paymentQr && (
                        <p style={{ margin: '10px 0 0', fontSize: '13px' }}>
                            <strong>UPI ID:</strong> {invoice.paymentQr}
                        </p>
                    )}
                </div>

                {invoice.qrCodeImage && (
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '6px' }}>
                            Scan to Pay
                        </div>
                        <img
                            src={invoice.qrCodeImage}
                            alt="Payment QR"
                            style={{ width: '100px', height: '100px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '8px', padding: '4px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceTemplate;
