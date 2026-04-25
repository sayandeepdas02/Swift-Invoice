import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';

const ProcessSection = () => {
  return (
    <SectionWrapper id="process" label="The process" step="4" total="8">
      <div className="flex flex-col">
        
        {/* Top Column: Copy & Steps */}
        <div className="border-b pb-8 mb-8" style={{ borderColor: 'var(--color-line)' }}>
          <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.05] text-foreground mb-12">
            From creation to cash.
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Create', desc: 'Smart templates remember your terms and clients.' },
              { num: '02', title: 'Send', desc: 'One-click share links with embedded payments.' },
              { num: '03', title: 'Get paid', desc: 'Clients pay instantly. Get real-time alerts.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col group border-t pt-4" style={{ borderColor: 'var(--color-line)' }}>
                <div className="font-mono text-xs font-bold text-brand mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2 group-hover:text-brand transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-balance">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Column: Visual graphic */}
        <div className="w-full aspect-video sm:aspect-[21/9] rounded-xl border bg-muted/30 shadow-sm overflow-hidden flex items-center justify-center relative" style={{ borderColor: 'var(--color-border)' }}>
          {/* Grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--pattern-foreground)_1px,transparent_0)] bg-[size:16px_16px] opacity-30" style={{ '--pattern-foreground': 'color-mix(in oklab, var(--color-foreground) 15%, transparent)' }} />
          
          <div className="flex items-center justify-center gap-4 sm:gap-8 z-10 w-full px-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-foreground flex items-center justify-center shadow-sm transition-transform hover:scale-105">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-sm border-2 border-background" />
            </div>
            
            <div className="flex-1 h-0.5 bg-line" style={{ backgroundColor: 'var(--color-line)' }} />
            
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-brand flex items-center justify-center shadow-sm transition-transform hover:scale-105">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>

            <div className="flex-1 h-0.5 bg-line" style={{ backgroundColor: 'var(--color-line)' }} />
            
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-emerald-500 flex items-center justify-center shadow-sm transition-transform hover:scale-105">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
      </div>
    </SectionWrapper>
  );
};

export default ProcessSection;
