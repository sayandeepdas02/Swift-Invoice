import React from 'react';
import SectionWrapper from '../ui/SectionWrapper';

const OutcomesSection = () => {
  return (
    <SectionWrapper id="outcomes" label="The outcomes" step="5" total="8" className="bg-muted/10">
      <div className="mb-8 border-b pb-8" style={{ borderColor: 'var(--color-line)' }}>
        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.05] text-foreground">
          Built to eliminate friction.
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 border-b" style={{ borderColor: 'var(--color-line)' }}>
        {[
          {
            title: "Never follow up manually again.",
            desc: "Set your schedule once. Swift Invoice sends polite, branded, and automated reminders before and after the due date. Reclaim your mental energy."
          },
          {
            title: "Know exactly when you'll get paid.",
            desc: "Stop wondering if they saw the email. Track when clients open, view, and pay your invoices with pixel-perfect read receipts and dashboard analytics."
          },
          {
            title: "Invoices that convert better.",
            desc: "Remove the friction of bank transfers. Every invoice includes a frictionless payment link. Clients can pay instantly via Stripe or UPI directly."
          },
          {
            title: "Look like a Fortune 500.",
            desc: "Your invoice is your final brand touchpoint. Use our pixel-perfect customization to ensure every bill you send reflects the premium quality of your work."
          }
        ].map((outcome, i) => (
          <div key={i} className={`flex flex-col justify-between py-8 sm:p-8 transition-colors hover:bg-background ${i % 2 === 0 ? 'sm:border-r' : ''} ${i < 2 ? 'border-b' : ''}`} style={{ borderColor: 'var(--color-line)' }}>
            <h3 className="text-xl font-semibold tracking-tight text-foreground mb-4 max-w-sm leading-tight">
              {outcome.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-auto max-w-md">
              {outcome.desc}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default OutcomesSection;
