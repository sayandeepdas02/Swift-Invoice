import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, Send, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: FileText,
    title: 'Build your invoice',
    desc: 'Open Swift Invoice, select your client, add your line items and rate. Your branded PDF is ready before you finish your coffee.',
    detail: 'Smart autofill pulls client details from your address book. Taxes, currency, and discount — all configurable in seconds.',
  },
  {
    step: '02',
    icon: Send,
    title: 'Send it in one click',
    desc: 'Hit send. Your client receives a professional email with a PDF attached and a link to view and pay online — no app required.',
    detail: 'Automated reminders kick in before and after the due date, so you never have to write that awkward follow-up email again.',
  },
  {
    step: '03',
    icon: CheckCircle,
    title: 'Get paid, stay in control',
    desc: 'Watch payments land in real time. Your dashboard tracks every invoice — paid, pending, or overdue — so nothing slips through.',
    detail: 'Export reports, reconcile faster, and know exactly where your business stands — any time, any device.',
  },
];

const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Progress line height 0→100% as you scroll the section
  const lineHeight = useTransform(scrollYProgress, [0, 0.9], ['0%', '100%']);

  return (
    <section id="how-it-works" ref={containerRef} className="w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%]">
      <div className="screen-line-top mx-auto w-full max-w-[1600px] border-x" style={{ borderColor: 'var(--color-line)' }}>

        {/* Header */}
        <div className="px-6 sm:px-12 md:px-16 lg:px-24 pt-12 pb-8 border-b" style={{ borderColor: 'var(--color-line)' }}>
          <div className="inline-flex items-center gap-2 border px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 rounded-sm" style={{ borderColor: 'var(--color-line)' }}>
            <span className="size-1.5 rounded-full bg-brand flex-shrink-0" />
            How it works
          </div>
          <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] text-foreground font-heading">
            Invoice → Send → Paid.<br className="hidden sm:block" />
            <span className="text-muted-foreground">That's the whole process.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="px-6 sm:px-12 md:px-16 lg:px-24 py-12 lg:py-16">
          <div className="relative">
            {/* Vertical progress line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-muted hidden sm:block" />
            <motion.div
              className="absolute left-[19px] top-0 w-px bg-brand hidden sm:block origin-top"
              style={{ height: lineHeight }}
            />

            <div className="space-y-0">
              {steps.map((step, index) => {
                const Icon = step.icon;
                // Each step activates at its scroll fraction
                const start = index / steps.length;
                const end = (index + 1) / steps.length;
                const isActive = useTransform(scrollYProgress, [start, end], [0, 1]);

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative flex gap-8 sm:gap-12 pb-0 ${index < steps.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: 'var(--color-line)' }}
                  >
                    {/* Step indicator */}
                    <div className="flex-shrink-0 hidden sm:flex flex-col items-center">
                      <motion.div
                        className="w-10 h-10 rounded-sm border-2 flex items-center justify-center bg-background relative z-10 transition-colors duration-300"
                        style={{
                          borderColor: 'var(--color-brand)',
                          backgroundColor: 'var(--color-background)',
                        }}
                        whileInView={{ backgroundColor: 'var(--color-brand)', color: 'white' }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                      >
                        <Icon size={18} strokeWidth={2} />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 py-10 lg:py-14 grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                      {/* Left */}
                      <div>
                        <div className="font-mono text-[10px] font-semibold text-brand uppercase tracking-widest mb-3">
                          Step {step.step}
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tighter text-foreground font-heading mb-4">
                          {step.title}
                        </h3>
                        <p className="text-base text-foreground/80 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                      {/* Right */}
                      <div className="border-l pl-8 lg:pl-12" style={{ borderColor: 'var(--color-line)' }}>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                          {step.detail}
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-brand flex-shrink-0" />
                          <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            {index === 0 ? 'Under 60 seconds' : index === 1 ? 'Zero manual work' : 'Full visibility'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
