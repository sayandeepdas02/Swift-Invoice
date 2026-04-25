import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import { Check } from 'lucide-react';

const ShowcaseSection = () => {
  return (
    <SectionWrapper id="showcase" label="The platform" step="3" total="8" className="bg-muted/10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Copy */}
        <div className="order-2 lg:order-1 flex flex-col justify-center">
          <h2 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] text-foreground mb-8">
            One interface.<br />Complete control.
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-xl">
            We stripped away the bloat. What's left is a lightning-fast editor that learns your clients, calculates taxes, and generates shareable payment links instantly.
          </p>
          
          <ul className="flex flex-col gap-6">
            {[
              'Create an invoice in under 30 seconds',
              'Preview exactly what your client sees',
              'One-click Stripe & UPI integration',
              'Auto-save and draft management'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="size-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-brand stroke-[3]" />
                </div>
                <span className="text-lg font-medium text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Visual Mockup */}
        <div className="order-1 lg:order-2 relative w-full h-[500px] lg:h-[700px] rounded-xl overflow-hidden border bg-card shadow-sm flex items-center justify-center" style={{ borderColor: 'var(--color-border)' }}>
          {/* Faux browser header */}
          <div className="absolute top-0 inset-x-0 h-12 border-b bg-muted/50 flex items-center px-6 gap-3" style={{ borderColor: 'var(--color-line)' }}>
            <div className="size-3.5 rounded-full bg-foreground/10" />
            <div className="size-3.5 rounded-full bg-foreground/10" />
            <div className="size-3.5 rounded-full bg-foreground/10" />
            <div className="mx-auto w-1/2 h-6 bg-background rounded-sm border" style={{ borderColor: 'var(--color-line)' }} />
          </div>
          
          {/* Faux Editor Body */}
          <div className="absolute top-12 inset-0 p-8 sm:p-12 flex flex-col bg-background">
            <div className="w-1/3 h-8 bg-foreground/5 rounded-sm mb-12" />
            
            <div className="flex justify-between items-end border-b pb-6 mb-8" style={{ borderColor: 'var(--color-line)' }}>
              <div className="space-y-3">
                <div className="w-24 h-3 bg-muted-foreground/30 rounded-sm" />
                <div className="w-48 h-4 bg-foreground/10 rounded-sm" />
                <div className="w-32 h-4 bg-foreground/10 rounded-sm" />
              </div>
              <div className="space-y-3 text-right">
                <div className="w-24 h-8 bg-foreground/10 rounded-sm ml-auto" />
                <div className="w-32 h-3 bg-muted-foreground/30 rounded-sm ml-auto" />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-4 mb-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-dashed" style={{ borderColor: 'var(--color-line)' }}>
                  <div className="w-64 sm:w-96 h-5 bg-foreground/5 rounded-sm" />
                  <div className="w-20 sm:w-24 h-5 bg-foreground/10 rounded-sm" />
                </div>
              ))}
            </div>

            {/* Footer Total */}
            <div className="flex justify-end pt-8">
              <div className="w-56 h-14 bg-brand/10 rounded-sm flex justify-between items-center px-6 border border-brand/20">
                <div className="w-16 h-3 bg-brand/40 rounded-sm" />
                <div className="w-24 h-5 bg-brand rounded-sm" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </SectionWrapper>
  );
};

export default ShowcaseSection;
