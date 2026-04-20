import React from 'react';
import { Trash2 } from 'lucide-react';
import Input from '../../../components/ui/Input';

const LineItemRow = ({ 
    item, 
    index, 
    currencySymbol, 
    onChange, 
    onRemove, 
    isActive, 
    onFocus, 
    onBlur, 
    savedServices, 
    onSelectService 
}) => {
    return (
        <div className="grid grid-cols-[1fr_80px_120px_100px_40px] gap-4 items-center group relative border-b border-slate-100 pb-2">
            
            <div className="relative">
                <Input
                    className="h-10 text-sm border-transparent hover:border-slate-200 focus:border-brand-base focus:ring-opacity-50"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => onChange(index, 'description', e.target.value)}
                    onFocus={() => onFocus(index)}
                    onBlur={onBlur}
                />
                {isActive && item.description && savedServices?.length > 0 && (
                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-slate-200 shadow-xl z-30 max-h-40 overflow-y-auto rounded-sm">
                        {savedServices
                            .filter(s => s.name.toLowerCase().includes(item.description.toLowerCase()))
                            .slice(0, 5)
                            .map(s => (
                                <div
                                    key={s._id}
                                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); 
                                        onSelectService(index, s);
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

            <div>
                <Input
                    type="number"
                    min="1"
                    className="h-10 text-center text-sm border-transparent hover:border-slate-200 focus:border-brand-base"
                    value={item.quantity}
                    onChange={(e) => onChange(index, 'quantity', Number(e.target.value))}
                />
            </div>

            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm z-10 pointer-events-none">{currencySymbol}</span>
                <Input
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-10 text-right pl-8 text-sm border-transparent hover:border-slate-200 focus:border-brand-base"
                    value={item.rate}
                    onChange={(e) => onChange(index, 'rate', Number(e.target.value))}
                />
            </div>

            <div className="text-right text-sm font-semibold text-slate-900 px-2 tracking-tight">
                {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={() => onRemove(index)} 
                    className="w-8 h-8 flex justify-center items-center text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
        </div>
    );
};

export default LineItemRow;
