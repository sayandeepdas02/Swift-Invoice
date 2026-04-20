import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Card from './Card';

const Modal = ({ isOpen, onClose, title, children }) => {
    // Prevent background scrolling mapping cleanly locally
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 px-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <Card className="w-full max-w-lg relative z-10 flex flex-col max-h-[90vh] overflow-hidden p-0 rounded-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
                    <h3 className="text-sm font-bold tracking-tight text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-white flex-1">
                    {children}
                </div>
            </Card>
        </div>
    );
};

export default Modal;
