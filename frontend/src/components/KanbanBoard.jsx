import React, { useMemo } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
    { id: 'draft', label: 'Draft', color: '#94a3b8', draggable: true },
    { id: 'sent', label: 'Sent', color: '#60a5fa', draggable: true },
    { id: 'viewed', label: 'Viewed', color: '#a78bfa', draggable: true },
    { id: 'awaiting_payment', label: 'Awaiting Payment', color: '#fb923c', draggable: true },
    { id: 'paid', label: 'Paid', color: '#34d399', draggable: true },
    { id: 'overdue', label: 'Overdue', color: '#f87171', draggable: false },
];

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
const currSym = (code) => CURRENCIES[code] || code;

const computeOverdue = (inv) => !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

const InvoiceCard = ({ invoice, onClick, isDragging = false }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({ id: invoice._id, disabled: computeOverdue(invoice) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging ? 'shadow-hover rotate-1 border-brand-base' : ''}`}
            onClick={() => !isSortDragging && onClick(invoice)}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                    #{invoice.invoiceNumber}
                </span>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-text-secondary flex-shrink-0">
                    <GripVertical size={14} />
                </div>
            </div>

            <p className="font-semibold text-text-primary text-sm leading-tight mb-2 line-clamp-1">
                {invoice.client?.name || 'No client'}
            </p>

            <p className="text-lg font-semibold tracking-tight text-text-primary mb-3">
                {currSym(invoice.currency)}{Number(invoice.totalAmount).toFixed(2)}
            </p>

            <div className="flex items-center justify-between gap-2 border-t border-border-base pt-2">
                {invoice.dueDate ? (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold ${computeOverdue(invoice) ? 'text-red-500' : 'text-slate-400'}`}>
                        <Calendar size={10} />
                        {format(new Date(invoice.dueDate), 'dd MMM yy')}
                    </span>
                ) : <span />}

                {computeOverdue(invoice) && (
                    <span className="badge-overdue text-[9px] px-1 py-0.5">
                        <AlertTriangle size={8} /> Overdue
                    </span>
                )}
            </div>
        </div>
    );
};

const KanbanColumn = ({ col, invoices, onCardClick, activeId }) => {
    const isReadOnly = !col.draggable;

    return (
        <div className={`kanban-col ${isReadOnly ? 'kanban-col-readonly opacity-60' : ''}`}>
            <div className="kanban-col-header">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">{col.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                    {invoices.length}
                </span>
            </div>

            <SortableContext items={invoices.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="kanban-col-body p-2 gap-2 bg-slate-50">
                    {invoices.map(inv => (
                        <InvoiceCard
                            key={inv._id}
                            invoice={inv}
                            onClick={onCardClick}
                            isDragging={activeId === inv._id}
                        />
                    ))}
                    {invoices.length === 0 && (
                        <div className={`kanban-empty-slot bg-transparent ${isReadOnly ? 'border-none' : ''}`}>
                            {isReadOnly ? '' : 'Drop here'}
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

const KanbanBoard = ({ invoices, onStatusChange, onCardClick }) => {
    const [activeId, setActiveId] = React.useState(null);
    const [prevStatus, setPrevStatus] = React.useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const grouped = useMemo(() => {
        const map = {};
        COLUMNS.forEach(col => { map[col.id] = []; });
        invoices.forEach(inv => {
            if (computeOverdue(inv)) {
                map['overdue'].push(inv);
            } else {
                const col = map[inv.status];
                if (col) col.push(inv);
                else map['draft'].push(inv);
            }
        });
        return map;
    }, [invoices]);

    const activeInvoice = useMemo(() => invoices.find(i => i._id === activeId), [activeId, invoices]);

    const findColumnOfInvoice = (id) => {
        for (const col of COLUMNS) {
            if (grouped[col.id]?.some(i => i._id === id)) return col.id;
        }
        return null;
    };

    const handleDragStart = ({ active }) => {
        setActiveId(active.id);
        setPrevStatus(findColumnOfInvoice(active.id));
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null);
        if (!over) return;
        const targetColId = COLUMNS.find(col => col.id === over.id)?.id || findColumnOfInvoice(over.id);
        if (!targetColId) return;
        const targetCol = COLUMNS.find(c => c.id === targetColId);
        if (!targetCol?.draggable) return;
        const currentStatus = prevStatus;
        if (currentStatus === targetColId) return;
        onStatusChange(active.id, targetColId, currentStatus);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="kanban-board">
                {COLUMNS.map(col => (
                    <KanbanColumn
                        key={col.id}
                        col={col}
                        invoices={grouped[col.id] || []}
                        onCardClick={onCardClick}
                        activeId={activeId}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
                {activeInvoice ? <InvoiceCard invoice={activeInvoice} onClick={() => { }} isDragging /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
