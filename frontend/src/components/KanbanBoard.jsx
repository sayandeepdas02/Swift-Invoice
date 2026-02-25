import React, { useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, Calendar, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

// ── Constants ──────────────────────────────────────────────────────
const COLUMNS = [
    { id: 'draft', label: 'Draft', color: '#94a3b8', draggable: true },
    { id: 'sent', label: 'Sent', color: '#60a5fa', draggable: true },
    { id: 'viewed', label: 'Viewed', color: '#a78bfa', draggable: true },
    { id: 'awaiting_payment', label: 'Awaiting Payment', color: '#fb923c', draggable: true },
    { id: 'paid', label: 'Paid', color: '#34d399', draggable: true },
    { id: 'overdue', label: 'Overdue', color: '#f87171', draggable: false },
];

const CURRENCIES = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', AUD: 'A$', CAD: 'C$', SGD: 'S$',
};

const currSym = (code) => CURRENCIES[code] || code;

// ── Overdue helper ────────────────────────────────────────────────
const computeOverdue = (inv) =>
    !inv.paidAt && inv.dueDate && new Date() > new Date(inv.dueDate);

// ── Sortable Card ────────────────────────────────────────────────
const InvoiceCard = ({ invoice, onClick, isDragging = false }) => {
    const {
        attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging,
    } = useSortable({ id: invoice._id, disabled: computeOverdue(invoice) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging ? 'shadow-2xl rotate-1 scale-105' : ''}`}
            onClick={() => !isSortDragging && onClick(invoice)}
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-black text-zinc-400 tracking-widest uppercase">
                    #{invoice.invoiceNumber}
                </span>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 flex-shrink-0 mt-0.5">
                    <GripVertical size={14} />
                </div>
            </div>

            <p className="font-bold text-zinc-800 text-sm leading-tight mb-3 line-clamp-1">
                {invoice.client?.name || 'No client'}
            </p>

            <p className="text-2xl font-black tracking-tight text-zinc-900 mb-3">
                {currSym(invoice.currency)}{Number(invoice.totalAmount).toFixed(2)}
            </p>

            <div className="flex items-center justify-between gap-2">
                {invoice.dueDate ? (
                    <span className={`flex items-center gap-1 text-[10px] font-semibold ${computeOverdue(invoice) ? 'text-red-500' : 'text-zinc-400'}`}>
                        <Calendar size={10} />
                        {format(new Date(invoice.dueDate), 'dd MMM yy')}
                    </span>
                ) : <span />}

                {computeOverdue(invoice) && (
                    <span className="badge-overdue">
                        <AlertTriangle size={9} /> Overdue
                    </span>
                )}
            </div>
        </div>
    );
};

// ── Column ────────────────────────────────────────────────────────
const KanbanColumn = ({ col, invoices, onCardClick, activeId }) => {
    const isReadOnly = !col.draggable;

    return (
        <div className={`kanban-col ${isReadOnly ? 'kanban-col-readonly' : ''}`}>
            <div className="kanban-col-header">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">{col.label}</span>
                </div>
                <span className="text-[11px] font-black text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
                    {invoices.length}
                </span>
            </div>

            <SortableContext items={invoices.map(i => i._id)} strategy={verticalListSortingStrategy}>
                <div className="kanban-col-body">
                    {invoices.map(inv => (
                        <InvoiceCard
                            key={inv._id}
                            invoice={inv}
                            onClick={onCardClick}
                            isDragging={activeId === inv._id}
                        />
                    ))}
                    {invoices.length === 0 && (
                        <div className={`kanban-empty-slot ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isReadOnly ? 'Auto-computed' : 'Drop here'}
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

// ── Main Board ────────────────────────────────────────────────────
const KanbanBoard = ({ invoices, onStatusChange, onCardClick }) => {
    const [activeId, setActiveId] = React.useState(null);
    const [prevStatus, setPrevStatus] = React.useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // Group invoices by column — overdue is computed separately
    const grouped = useMemo(() => {
        const map = {};
        COLUMNS.forEach(col => { map[col.id] = []; });

        invoices.forEach(inv => {
            if (computeOverdue(inv)) {
                map['overdue'].push(inv);
            } else {
                const col = map[inv.status];
                if (col) col.push(inv);
                else map['draft'].push(inv); // fallback for legacy statuses
            }
        });
        return map;
    }, [invoices]);

    const activeInvoice = useMemo(
        () => invoices.find(i => i._id === activeId),
        [activeId, invoices]
    );

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

    const handleDragOver = () => { }; // handled in DragEnd

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null);
        if (!over) return;

        // Determine target column
        const targetColId = COLUMNS.find(col => col.id === over.id)?.id
            || findColumnOfInvoice(over.id);

        if (!targetColId) return;

        // Block drop into Overdue column
        const targetCol = COLUMNS.find(c => c.id === targetColId);
        if (!targetCol?.draggable) return;

        const currentStatus = prevStatus;
        if (currentStatus === targetColId) return;

        // Fire parent handler (handles optimistic + API)
        onStatusChange(active.id, targetColId, currentStatus);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
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
                {activeInvoice ? (
                    <InvoiceCard invoice={activeInvoice} onClick={() => { }} isDragging />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
