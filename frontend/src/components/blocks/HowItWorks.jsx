import React, { useState } from 'react';
import SectionLabel from '../ui/SectionLabel';
import { FileText, Send, BarChart3, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: '01', icon: FileText, title: 'Create invoices in seconds',
    description: 'Clean templates, smart autofill, and reusable client profiles. Fill in the blanks — Swift Invoice handles the rest.',
    tags: ['Smart templates', 'Auto-fill', 'Reusable clients'],
    grad: 'from-rose-500 to-pink-600',
  },
  {
    number: '02', icon: Send, title: 'Send & get paid instantly',
    description: 'Share a link, accept UPI or card payments, and watch payment status update in real-time.',
    tags: ['Shareable link', 'UPI / Cards', 'Live tracking'],
    grad: 'from-violet-500 to-purple-600',
  },
  {
    number: '03', icon: BarChart3, title: 'Stay on top of your business',
    description: 'Automated reminders, revenue reports, and client insights — so you always know where your money is.',
    tags: ['Auto reminders', 'Revenue reports', 'Client insights'],
    grad: 'from-emerald-500 to-teal-600',
  },
];

const HowItWorks = () => {
  const [active, setActive] = useState(0);
  const cur = steps[active];
  const Icon = cur.icon;

  return (
    /* chanhdai section: px-2, border-x, screen-line-top, md:max-w-3xl */
    <section id="how-it-works" className="max-w-screen overflow-x-hidden bg-background px-2">
      <div className="screen-line-top mx-auto border-x py-16 md:py-24 md:max-w-3xl"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="px-4">
          <SectionLabel label="How it works" page="2" total="6" />

          <div className="mt-10 mb-12">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-3">
              Everything you need to invoice —{' '}
              <span className="gradient-text">nothing you don't.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Three simple steps from creation to payment. No learning curve.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Step list */}
            <div className="flex flex-col gap-2">
              {steps.map((s, i) => {
                const SI = s.icon;
                const on = active === i;
                return (
                  <button key={i} onClick={() => setActive(i)}
                    className={`group text-left rounded-xl border p-4 transition-all duration-200 ${on ? 'border-border bg-accent/30' : 'border-transparent hover:border-border hover:bg-accent/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`size-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${s.grad} transition-opacity ${on ? 'opacity-100' : 'opacity-35'}`}>
                        <SI size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${on ? 'text-brand' : 'text-muted-foreground'} transition-colors`}>
                          Step {s.number}
                        </span>
                        <h3 className={`text-sm font-medium mt-0.5 ${on ? 'text-foreground' : 'text-muted-foreground'} transition-colors`}>
                          {s.title}
                        </h3>
                        {on && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed animate-fade-in-up">
                            {s.description}
                          </p>
                        )}
                      </div>
                      <div className={`size-1.5 rounded-full flex-shrink-0 mt-1.5 transition-colors ${on ? 'bg-brand' : 'bg-border'}`} />
                    </div>
                    {on && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pl-12 animate-fade-in-up">
                        {s.tags.map(t => (
                          <span key={t} className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Visual panel — chanhdai card: rounded-xl ring-1 ring-foreground/10 */}
            <div className="rounded-xl overflow-hidden border bg-card shadow-xs" style={{ minHeight: 320 }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${cur.grad} opacity-[0.04] pointer-events-none`} />
              <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 h-full" style={{ minHeight: 320 }}>
                <div className={`size-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${cur.grad} mb-5 shadow-sm`}>
                  <Icon size={30} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">{cur.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">{cur.description}</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {cur.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground shadow-xs">
                      <CheckCircle2 size={10} className="text-brand" />
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-6">
                  {steps.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`rounded-full transition-all duration-200 ${active === i ? 'w-5 h-2 bg-brand' : 'size-2 bg-border hover:bg-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
