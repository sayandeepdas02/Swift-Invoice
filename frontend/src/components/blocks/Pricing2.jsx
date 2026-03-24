import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Switch } from "@/components/ui/switch";

export const Pricing2 = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  const plans = [
    {
      id: "starter",
      name: "STARTER",
      description: "Perfect for freelancers getting started.",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      priceSuffix: "/month",
      features: [
        { text: "100 invoices/month" },
        { text: "Basic invoice templates" },
        { text: "PDF exports" },
        { text: "Manual client management" },
        { text: "Standard support" },
      ],
      button: {
        text: "Get Started",
        url: "/signup",
      },
    },
    {
      id: "growth",
      name: "GROWTH",
      description: "Everything you need to run your business professionally.",
      monthlyPrice: "$5",
      yearlyPrice: "$4",
      priceSuffix: "/month",
      features: [
        { text: "Unlimited invoices" },
        { text: "Custom branding (logo + colors)" },
        { text: "Remove Swift Invoice branding" },
        { text: "Payment QR codes (UPI / Stripe-ready)" },
        { text: "Invoice tracking (paid / pending)" },
        { text: "Smart client management" },
        { text: "Basic analytics" },
        { text: "Priority support" },
      ],
      button: {
        text: "Start Free Trial",
        url: "/signup",
      },
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      description: "Built for teams and growing businesses.",
      monthlyPrice: "$12",
      yearlyPrice: "$10",
      priceSuffix: "/seat /month",
      features: [
        { text: "Everything in Growth" },
        { text: "Multi-user team access" },
        { text: "Role-based permissions" },
        { text: "Shared client database" },
        { text: "Advanced analytics & reports" },
        { text: "API access" },
        { text: "Custom domain" },
        { text: "Dedicated support" },
      ],
      button: {
        text: "Contact Sales",
        url: "/contact",
      },
    },
  ];

  return (
    <section className="w-full bg-slate-50 border-b border-slate-200 flex flex-col items-center pb-24">
      
      {/* Header area in Pricing matches ParadeDB flat header */}
      <div className="pt-24 pb-16 w-full flex flex-col items-center text-center px-6 bg-slate-50">
          <div className="mb-8 px-3 py-1 border border-slate-200 text-xs font-semibold text-text-secondary uppercase tracking-widest bg-white shadow-none">
            PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-text-primary">
            Ready to scale your invoicing
          </h2>
          <p className="text-lg text-text-secondary mt-6 max-w-2xl leading-relaxed">
            Simple, transparent pricing for freelancers and teams.
          </p>
          
          <div className="flex items-center gap-3 text-sm font-semibold text-text-primary mt-10 bg-white border border-slate-200 px-4 py-2 hover:bg-slate-50 transition-colors shadow-none cursor-pointer">
            Monthly
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
              className="data-[state=checked]:bg-brand-base data-[state=unchecked]:bg-slate-200"
            />
            Yearly <span className="text-xs text-brand-base ml-1 font-bold tracking-tight">SAVE 20%</span>
          </div>
      </div>

      {/* Grid area */}
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 bg-white border border-slate-200 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between text-left p-8 min-h-[420px] transition-colors duration-150 ${plan.id === 'growth' ? 'relative lg:transform lg:scale-100 lg:-mx-px border-x-2 border-brand-base bg-pink-50/30 z-10' : 'hover:bg-slate-50'}`}
                >
                  {plan.id === 'growth' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs border border-brand-base px-3 py-1 bg-white font-bold tracking-widest uppercase text-brand-base z-20">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{plan.name}</h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold tracking-tight text-slate-900">{isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                      <span className="text-base text-slate-500 ml-1 font-medium">{plan.priceSuffix}</span>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-8 h-10 border-b border-slate-100 pb-12">
                      {plan.description}
                    </p>
                    
                    <ul className="space-y-4 mb-12">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-4 h-4 mt-0.5 text-brand-base flex-shrink-0" />
                          <span className="text-sm text-slate-700 font-medium tracking-tight">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-auto">
                      <a href={plan.button.url} className="w-full">
                        <Button 
                          className={`w-full shadow-none rounded-none transition-all duration-150 py-6 text-xs uppercase tracking-widest font-bold hover:bg-slate-900 hover:text-white ${plan.id === 'growth' ? 'bg-brand-base text-white border-transparent hover:bg-brand-hover' : 'bg-transparent text-slate-900 border-2 border-slate-200 hover:border-slate-900'}`} 
                        >
                          {plan.button.text}
                        </Button>
                      </a>
                  </div>
                </div>
              ))}
        </div>
        
        <div className="text-center text-sm font-medium text-slate-500 mt-8 tracking-tight">
          No credit card required &bull; Cancel anytime
        </div>
      </div>
    </section>
  );
};
