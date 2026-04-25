import React, { useState } from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter', desc: 'Everything you need to look professional.', price: 0,
    features: ['Unlimited invoices', 'Basic templates', 'Payment links (Stripe/UPI)'],
    cta: 'Start Free'
  },
  {
    name: 'Pro', desc: 'For growing businesses that need automation.', price: 12,
    features: ['Automated reminders', 'Custom branding', 'Advanced analytics', 'Priority support'],
    cta: 'Start Pro Trial',
    highlight: true
  }
];

const PricingSection = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <SectionWrapper id="pricing">
      <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
        
        {/* Left Side: Philosophy */}
        <div className="lg:col-span-1 border-b lg:border-b-0 pb-12 lg:pb-0" style={{ borderColor: 'var(--color-line)' }}>
          <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter leading-[1.05] text-foreground mb-6">
            Simple pricing.<br />Infinite ROI.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Start for free. Upgrade only when you need advanced automation and custom branding to scale your business.
          </p>

          <div className="inline-flex items-center rounded-sm p-1 bg-muted border" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => setYearly(false)} className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors ${!yearly ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-widest rounded-sm transition-colors ${yearly ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground'}`}>Yearly <span className="text-brand">-20%</span></button>
          </div>
        </div>

        {/* Right Side: Plans */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <div key={i} className={`flex flex-col p-8 rounded-sm border ${plan.highlight ? 'border-brand bg-brand/[0.02]' : 'bg-background'}`} style={plan.highlight ? {} : { borderColor: 'var(--color-border)' }}>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">{plan.desc}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-semibold tracking-tighter">${yearly && plan.price > 0 ? Math.floor(plan.price * 0.8) : plan.price}</span>
                <span className="text-sm text-muted-foreground font-medium">/mo</span>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-1">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <Check size={16} className={plan.highlight ? 'text-brand' : 'text-foreground'} strokeWidth={2.5} />
                    <span className="text-sm font-medium text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup">
                <button className={`w-full h-12 flex items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-colors ${plan.highlight ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>
                  {plan.cta}
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </SectionWrapper>
  );
};

export default PricingSection;
