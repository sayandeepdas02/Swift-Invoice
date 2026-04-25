import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FileText, LayoutDashboard, Send } from 'lucide-react';

const features = [
  {
    id: 'create',
    step: '01',
    icon: FileText,
    label: 'Create',
    title: 'Build a professional invoice in seconds',
    desc: 'Fill in your client details, add line items, attach your logo — Swift Invoice handles the math, formatting, and PDF generation automatically.',
    bullets: ['Smart client autofill', 'Automatic tax calculation', 'Branded PDF, instantly'],
    image: '/feature-create.png',
    imageAlt: 'Swift Invoice — Create Invoice screen',
  },
  {
    id: 'dashboard',
    step: '02',
    icon: LayoutDashboard,
    label: 'Track',
    title: 'Real-time revenue dashboard, always in sync',
    desc: 'Your entire billing operation on one screen. Total revenue, pending amounts, overdue invoices — no spreadsheets, no guesswork.',
    bullets: ['Live payment status', 'Revenue & cashflow charts', 'Overdue alerts at a glance'],
    image: '/feature-dashboard.png',
    imageAlt: 'Swift Invoice — Dashboard overview',
  },
  {
    id: 'send',
    step: '03',
    icon: Send,
    label: 'Send & Collect',
    title: 'Send invoices, automate follow-ups',
    desc: 'One-click email delivery with a professional PDF attachment. Set automated reminders so clients never forget — without you having to ask.',
    bullets: ['One-click email send', 'Automated payment reminders', 'Client-facing payment portal'],
    image: '/feature-send.png',
    imageAlt: 'Swift Invoice — Send Invoice screen',
  },
];

const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['3%', '-3%']);
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className="grid lg:grid-cols-2 gap-0 border-b last:border-b-0"
      style={{ borderColor: 'var(--color-line)' }}
    >
      {/* Left: Copy */}
      <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-12 lg:py-16 order-2 lg:order-1 border-t lg:border-t-0 lg:border-r" style={{ borderColor: 'var(--color-line)' }}>
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Step badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-brand" strokeWidth={2} />
            </div>
            <span className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {feature.step} — {feature.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tighter leading-tight text-foreground font-heading">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-base text-muted-foreground leading-relaxed">
            {feature.desc}
          </p>

          {/* Bullets */}
          <ul className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-line)' }}>
            {feature.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                <span className="size-1.5 rounded-full bg-brand flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Right: Image */}
      <div className="order-1 lg:order-2 overflow-hidden bg-muted/10 flex items-center justify-center px-6 pt-8 lg:px-10 lg:pt-10 relative"
        style={{ minHeight: '400px' }}>
        {/* subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(var(--color-line) 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }}
        />
        <motion.div style={{ y: imageY }} className="relative z-10 w-full max-w-[580px]">
          <img
            src={feature.image}
            alt={feature.imageAlt}
            className="w-full h-auto object-contain drop-shadow-2xl rounded-sm"
          />
        </motion.div>
      </div>
    </div>
  );
};

const FeaturesSection = () => (
  <section id="features" className="w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%]">
    <div className="screen-line-top mx-auto w-full max-w-[1600px] border-x" style={{ borderColor: 'var(--color-line)' }}>

      {/* Section header */}
      <div className="px-6 sm:px-12 md:px-16 lg:px-24 pt-12 pb-8 border-b" style={{ borderColor: 'var(--color-line)' }}>
        <div className="inline-flex items-center gap-2 border px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 rounded-sm" style={{ borderColor: 'var(--color-line)' }}>
          <span className="size-1.5 rounded-full bg-brand flex-shrink-0" />
          Features
        </div>
        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] text-foreground font-heading">
          Everything you need.<br className="hidden sm:block" /> Nothing you don't.
        </h2>
      </div>

      {/* Feature rows */}
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} feature={feature} index={index} />
      ))}
    </div>
  </section>
);

export default FeaturesSection;
