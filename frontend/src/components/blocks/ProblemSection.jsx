import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';

const ProblemSection = () => {
  return (
    <SectionWrapper id="problem" label="What we solve" step="1" total="8" borderTop={true} className="bg-muted/10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        
        {/* Left: Headline */}
        <div>
          <h2 className="text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tighter leading-[1.05] text-foreground sticky top-32">
            Getting paid shouldn't be a part-time job.
          </h2>
        </div>
        
        {/* Right: Content & Pain points */}
        <div className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-6">
            <div className="text-2xl text-foreground font-medium leading-tight">
              You do the work, send the PDF, and then... nothing. You wait. You send awkward follow-up emails.
            </div>
            <div className="text-lg text-muted-foreground leading-relaxed">
              You lose track of who owes what in a messy spreadsheet. Your business deserves a financial workflow, not a filing cabinet. Relying on manual invoicing means you are actively delaying your own revenue.
            </div>
          </div>

          {/* Stark typographic pain points */}
          <div className="flex flex-col gap-8 border-t pt-8 mt-4" style={{ borderColor: 'var(--color-line)' }}>
            {[
              { id: '01', text: 'Late payments cripple your cash flow.' },
              { id: '02', text: 'Manual follow-ups ruin client relationships.' },
              { id: '03', text: 'Zero visibility leads to financial anxiety.' },
            ].map((pain, i) => (
              <div key={pain.id} className={`flex items-start gap-6 pb-8 ${i !== 2 ? 'border-b' : ''}`} style={{ borderColor: 'var(--color-line)' }}>
                <span className="font-mono text-sm font-bold text-brand mt-1">{pain.id}</span>
                <span className="text-2xl tracking-tight font-medium text-foreground text-balance">{pain.text}</span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ProblemSection;
