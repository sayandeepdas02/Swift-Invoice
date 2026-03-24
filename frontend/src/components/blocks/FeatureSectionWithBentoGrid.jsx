import React from "react";
import { FileText, PieChart, Video, Zap, FileJson, Mail } from "lucide-react";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Advanced tokenization",
      description: "12+ different modules to break apart and organize billing entries.",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "Multi-currency support",
      description: "Support for 20+ currencies, including dict-based tracking.",
      icon: <PieChart className="w-5 h-5" />
    },
    {
      title: "Watch our guided tour",
      description: "Get to know our platform functionality with guided structured demos.",
      icon: <Video className="w-5 h-5" />
    },
    {
      title: "Deploy in seconds",
      description: "With our state-of-the-art platform, manage boundaries instantly.",
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: "JSON Export Support",
      description: "Export all your financial records safely to a pristine JSON format.",
      icon: <FileJson className="w-5 h-5" />
    },
    {
      title: "Automated Emailing",
      description: "Configure automatic delivery rules for your trusted clients.",
      icon: <Mail className="w-5 h-5" />
    },
  ];

  return (
    <div className="w-full border-b border-slate-200 bg-white">
      {/* Header Section */}
      <div className="py-24 border-b border-slate-200 flex flex-col items-center text-center px-6 bg-white relative overflow-hidden">
          <div className="mb-8 px-3 py-1 border border-slate-200 text-xs font-semibold text-text-secondary uppercase tracking-widest bg-slate-50 rounded-sm">
            Features
          </div>
          <h2 className="text-4xl md:text-[56px] leading-[1.1] font-semibold tracking-tight text-text-primary z-10">
            The <span className="text-brand-base">complete</span> toolkit<br/>for professional billing
          </h2>
          <p className="text-lg text-text-secondary mt-6 max-w-2xl leading-relaxed z-10">
            Swift Invoice brings everything you need from a modern financial engine into your browser, structured for speed and reliability.
          </p>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden">
        {features.map((feature, idx) => (
          <div 
            key={idx} 
            className={`p-10 lg:p-12 bg-white hover:bg-slate-50 transition-colors duration-150 group border border-slate-200 border-t-0
              ${idx % 3 !== 2 ? 'lg:border-r-0' : ''} 
              ${idx % 2 !== 1 ? 'md:border-r-0 lg:border-r' : ''}
              ${idx < 3 ? 'lg:border-b-0' : ''}
            `}
          >
            <div className="w-10 h-10 flex items-center text-brand-base mb-6 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
            </div>
            <h3 className="font-semibold text-text-primary text-base tracking-tight mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed tracking-tight">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}