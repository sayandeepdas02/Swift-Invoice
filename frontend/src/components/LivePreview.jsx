import React, { useState } from 'react';
import { Download, ZoomIn, Link2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import InvoiceTemplate from './InvoiceTemplate';

// A4 at 96dpi = 794 × 1123px — the canonical canvas size
const A4_WIDTH = 794;

const ZOOM_OPTIONS = [
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1 },
    { label: '125%', value: 1.25 },
];

const LivePreview = ({ invoice, subtotal, taxAmount, totalAmount, currencySymbol, onDownload, isDownloading }) => {
    const [zoom, setZoom] = useState(1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* ── Minimal Toolbar ───────────────────────────────────────── */}
            <div className="preview-toolbar !justify-end bg-transparent border-none pb-2">
                {/* Zoom selector */}
                <div className="preview-zoom-select-wrapper">
                    <ZoomIn size={14} className="text-zinc-400" />
                    <select
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="preview-zoom-select"
                        aria-label="Preview zoom level"
                    >
                        {ZOOM_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="text-zinc-400 pointer-events-none absolute right-2" />
                </div>
            </div>

            {/* ── A4 Canvas scroll area ─────────────────────────── */}
            <div className="preview-scroll-area">
                <div
                    className="preview-zoom-wrapper"
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        // Adjust outer container height so scrollbar reflects scaled size
                        marginBottom: `${(A4_WIDTH * 1.414 * zoom) - (A4_WIDTH * 1.414)}px`,
                    }}
                >
                    <motion.div
                        className="a4-canvas"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <InvoiceTemplate
                            invoice={invoice}
                            subtotal={subtotal}
                            taxAmount={taxAmount}
                            totalAmount={totalAmount}
                            currencySymbol={currencySymbol}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LivePreview;
