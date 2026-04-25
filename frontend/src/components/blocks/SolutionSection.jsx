import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import { ArrowRight } from 'lucide-react';

const SolutionSection = () => {
  return (
    <SectionWrapper id="solution" label="The fix" step="2" total="8">
      <div className="mb-8 border-b pb-8" style={{ borderColor: 'var(--color-line)' }}>
        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.05] text-foreground">
          Swift Invoice fixes the entire flow.
        </h2>
      </div>

      {/* Supermemory style stark grid */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-b" style={{ borderColor: 'var(--color-line)', divideColor: 'var(--color-line)' }}>
        
        {[
          {
            title: 'Creation',
            before: 'Manual formatting',
            after: 'Automated perfection',
            desc: 'Stop fighting with Word docs. Use templates that remember clients and calculate taxes instantly.'
          },
          {
            title: 'Tracking',
            before: 'Blind waiting',
            after: 'Real-time visibility',
            desc: 'Know exactly when an invoice is opened, viewed, and paid. Absolute clarity on your cash flow.'
          },
          {
            title: 'Collection',
            before: 'Awkward follow-ups',
            after: 'Silent automation',
            desc: 'Set it and forget it. We automatically send polite, branded reminders before and after due dates.'
          }
        ].map((item, i) => (
          <div key={i} className="flex flex-col py-8 sm:p-6 lg:p-8 transition-colors hover:bg-muted/10">
            <div className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-8">
              {item.title}
            </div>
            
            <div className="flex flex-col gap-2 mb-6">
              <div className="text-xs font-medium text-muted-foreground line-through decoration-brand/40 decoration-2">
                {item.before}
              </div>
              <ArrowRight size={12} className="text-brand" />
              <div className="text-xl font-semibold tracking-tight text-foreground">
                {item.after}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
              {item.desc}
            </p>
          </div>
        ))}

      </div>
    </SectionWrapper>
  );
};

export default SolutionSection;
