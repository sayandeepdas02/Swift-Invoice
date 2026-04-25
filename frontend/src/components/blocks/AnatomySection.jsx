import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import { MousePointerClick } from 'lucide-react';

const AnatomySection = () => {
  return (
    <SectionWrapper id="anatomy" label="The anatomy" step="6" total="8">
      <div className="border-b pb-8 mb-8" style={{ borderColor: 'var(--color-line)' }}>
        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.05] text-foreground mb-6">
          Why our invoices get paid 3x faster.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
          It's not just a PDF. It's a highly optimized payment collection interface designed using psychological triggers and frictionless UI.
        </p>
      </div>

      <div className="relative w-full aspect-square sm:aspect-video rounded-xl bg-muted/10 border flex items-center justify-center p-4 sm:p-12 overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-[size:16px_16px] opacity-30" style={{ '--pattern-foreground': 'color-mix(in oklab, var(--color-foreground) 15%, transparent)' }} />
        
        {/* The Invoice Interface Mockup */}
        <div className="relative z-10 w-full max-w-lg bg-background border shadow-md rounded-md p-6 sm:p-8" style={{ borderColor: 'var(--color-border)' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6 mb-6" style={{ borderColor: 'var(--color-line)' }}>
            <div>
              <div className="w-10 h-10 rounded-md bg-brand mb-4 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <div className="w-24 h-3 bg-foreground/10 rounded-sm mb-2" />
              <div className="w-32 h-2 bg-muted-foreground/30 rounded-sm" />
            </div>
            <div className="text-right">
              {/* Callout 1: Trust Signals */}
              <div className="absolute -right-4 sm:-right-24 top-8 flex items-center gap-2 group cursor-default">
                <div className="h-px w-8 sm:w-16 bg-brand hidden sm:block" />
                <div className="bg-brand text-white text-[10px] font-mono px-2 py-1 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute sm:relative right-0 translate-x-4 sm:translate-x-0">
                  Trust Signals: Crisp Brand
                </div>
                <div className="size-2 rounded-full bg-brand animate-pulse absolute left-[-4px] sm:-left-2" />
              </div>
              
              <div className="font-mono text-xl tracking-tighter font-bold text-foreground mb-1">INV-001</div>
              <div className="font-mono text-[10px] font-bold text-brand uppercase px-2 py-0.5 bg-brand/10 inline-block rounded-sm">
                Due Today
              </div>
            </div>
          </div>
          
          {/* Body */}
          <div className="space-y-4 mb-10">
             <div className="flex justify-between items-center py-2 border-b border-dashed" style={{ borderColor: 'var(--color-line)' }}>
                <div className="w-3/4 h-3 bg-foreground/10 rounded-sm" />
                <div className="w-1/5 h-3 bg-foreground/20 rounded-sm" />
             </div>
             <div className="flex justify-between items-center py-2 border-b border-dashed" style={{ borderColor: 'var(--color-line)' }}>
                <div className="w-1/2 h-3 bg-foreground/10 rounded-sm" />
                <div className="w-1/5 h-3 bg-foreground/20 rounded-sm" />
             </div>
          </div>

          {/* Footer & CTA */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Due</div>
              <div className="text-3xl font-bold tracking-tighter text-foreground">$4,250.00</div>
            </div>
            
            {/* Callout 2: Frictionless Pay Button */}
            <div className="relative w-full sm:w-auto">
              <div className="absolute -left-4 sm:-left-32 top-1/2 -translate-y-1/2 flex flex-row-reverse items-center gap-2 group cursor-default z-20">
                <div className="h-px w-8 sm:w-16 bg-emerald-500 hidden sm:block" />
                <div className="bg-emerald-500 text-white text-[10px] font-mono px-2 py-1 rounded-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute sm:relative left-0 -translate-x-4 sm:translate-x-0 z-30">
                  Zero Friction: Instant Pay
                </div>
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse absolute right-[-4px] sm:-right-2 z-20" />
              </div>

              <button className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 bg-foreground text-background font-medium text-sm rounded-sm hover:opacity-90 transition-opacity relative z-10">
                <MousePointerClick size={16} />
                Pay via Card or UPI
              </button>
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
};

export default AnatomySection;
