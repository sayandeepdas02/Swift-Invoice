import { useState } from "react";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Switch } from "@/components/ui/switch";

export const Pricing2 = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  const plans = [
    {
      id: "community",
      name: "Community",
      description: "Perfect for testing and small projects that don't require multiple nodes.",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      features: [
        { text: "Fully free forever" },
        { text: "Supports a single mode (no read replicas)" },
        { text: "Community support" },
      ],
      button: {
        text: "GET STARTED",
        url: "/signup",
      },
    },
    {
      id: "pro",
      name: "Enterprise",
      description: "For high availability, read replicas, and dedicated support.",
      monthlyPrice: "$12",
      yearlyPrice: "$9",
      features: [
        { text: "Everything in Community" },
        { text: "Read replica support" },
        { text: "High availability" },
        { text: "Dedicated support and SLA" },
      ],
      button: {
        text: "CUSTOM PRICING",
        url: "/signup",
      },
    },
  ];

  return (
    <section className="w-full bg-slate-50 border-b border-slate-200 flex flex-col items-center">
      
      {/* Header area in Pricing matches ParadeDB flat header */}
      <div className="py-24 w-full flex flex-col items-center border-b border-slate-200 text-center px-6 bg-slate-50">
          <div className="mb-8 px-3 py-1 border border-slate-200 rounded-sm text-xs font-semibold text-text-secondary uppercase tracking-widest bg-white shadow-sm">
            Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-text-primary">
            Ready, set, <span className="text-brand-base">deploy</span>
          </h2>
          <p className="text-lg text-text-secondary mt-6 max-w-2xl leading-relaxed">
            Scale your freelancing business with confidence.
          </p>
          
          <div className="flex items-center gap-3 text-sm font-semibold text-text-primary mt-10 bg-white border border-slate-200 px-4 py-2 rounded-sm shadow-sm">
            Monthly
            <Switch
              checked={isYearly}
              onCheckedChange={() => setIsYearly(!isYearly)}
            />
            Yearly
          </div>
      </div>

      {/* Grid area */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 bg-white overflow-hidden border-t border-l border-r border-slate-200">
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                className={`flex flex-col justify-between text-left p-12 lg:p-16 hover:bg-slate-50 transition-colors duration-150 ${idx === 0 ? 'border-b md:border-b-0 md:border-r border-slate-200' : ''}`}
              >
                <div>
                  <div className="mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 bg-white w-max px-2 py-0.5 rounded-sm">
                    {plan.id === 'pro' ? 'SELF-MANAGED' : 'CLOUD-HOSTED'}
                  </div>
                  <h3 className="text-2xl font-semibold text-text-primary mb-3">{plan.name}</h3>
                  <p className="text-sm text-text-secondary mb-10 h-10">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-4 mb-12">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 text-brand-base flex-shrink-0" />
                        <span className="text-sm text-text-secondary font-medium tracking-tight">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-auto">
                    <a href={plan.button.url} className="w-full">
                      <Button 
                        className={`w-full shadow-none rounded-sm transition-all duration-150 py-6 text-xs uppercase tracking-widest font-medium hover:-translate-y-[1px] hover:bg-[#BE123C] hover:text-white ${plan.id === 'pro' ? 'bg-brand-base text-white' : 'bg-slate-100 text-text-primary border border-slate-200 hover:border-transparent'}`} 
                        variant={plan.id === 'pro' ? 'primary' : 'secondary'}
                      >
                        {plan.button.text}
                      </Button>
                    </a>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};
