import React from 'react';
import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoIcon from '../components/ui/LogoIcon';
import { AnimatedHero } from '../components/ui/AnimatedHero';
import { FeaturesSectionWithBentoGrid } from '../components/blocks/FeatureSectionWithBentoGrid';
import { Pricing2 } from '../components/blocks/Pricing2';

const testimonials = [
    {
      text: "This invoice builder unlocked our ability to rapidly launch new billing capabilities across our products — something that previously would have taken weeks of effort.",
      name: "Briana Patton",
      role: "Backend Engineer, Stripe",
    },
    {
      text: "Swift Invoice has excellent performance and throughput in billing, helping our clients achieve structured analysis and full-text retrieval using a pure engine.",
      name: "Bilal Ahmed",
      role: "Product Manager, Alibaba",
    },
    {
      text: "The sheer output speed is exceptional. Exactly what my clients need to process payments quickly without relying on external SaaS platforms.",
      name: "Saman Malik",
      role: "Creative Director, Vercel",
    }
];

const LandingPage = () => {
    return (
        <div className="pt-16 bg-slate-50 min-h-screen font-sans selection:bg-brand-base/20 selection:text-brand-base">
            
            <AnimatedHero />

            {/* Master Grid Container */}
            <main className="max-w-7xl mx-auto border-l border-r border-slate-200 bg-white flex flex-col min-h-screen relative shadow-sm">
                
                <FeaturesSectionWithBentoGrid />

                {/* Case Studies Block */}
                <section id="testimonials" className="w-full bg-white border-b border-slate-200">
                    <div className="py-24 border-b border-slate-200 flex flex-col items-center text-center px-6 bg-slate-50 relative overflow-hidden">
                        <div className="mb-8 px-3 py-1 border border-slate-200 rounded-sm text-xs font-semibold text-text-secondary uppercase tracking-widest bg-white shadow-sm z-10 transition-colors hover:bg-slate-50 cursor-default">
                            Case Studies
                        </div>
                        <h2 className="text-4xl md:text-[56px] leading-[1.1] font-semibold tracking-tight text-text-primary z-10">
                            <span className="text-brand-base">Trusted</span> by enterprises
                        </h2>
                        <p className="text-lg text-text-secondary mt-6 max-w-2xl leading-relaxed z-10 tracking-tight">
                            The most innovative companies are simplifying their billing stack with Swift Invoice.
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {testimonials.map((test, i) => (
                            <div key={i} className={`p-10 lg:p-14 bg-white flex flex-col justify-between hover:bg-slate-50 transition-colors duration-200 group ${i !== 2 ? 'border-b md:border-b-0 md:border-r border-slate-200' : ''}`}>
                                <Zap className="w-6 h-6 fill-slate-200 text-slate-200 mb-8 group-hover:fill-brand-base/20 transition-colors" />
                                <p className="text-text-primary text-sm font-medium leading-relaxed tracking-tight mb-16">
                                    "{test.text}"
                                </p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center text-text-secondary font-semibold text-sm">
                                        {test.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-text-primary tracking-tight">{test.name}</div>
                                        <div className="text-[10px] text-text-secondary mt-0.5 tracking-tight uppercase">{test.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div id="pricing">
                    <Pricing2 />
                </div>

                {/* Blog Section */}
                <section className="border-t border-slate-200 py-20 bg-white">
                  <div className="max-w-7xl mx-auto px-6 lg:px-8">
                
                    <div className="max-w-2xl">
                      <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        From the blog
                      </h2>
                      <p className="mt-2 text-sm text-slate-500 tracking-tight leading-relaxed">
                        Insights on invoicing, freelancing, and getting paid faster.
                      </p>
                    </div>
                
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                      {/* Blog Card */}
                      <div className="border border-slate-200 p-6 bg-white hover:bg-slate-50 transition-colors duration-150 cursor-pointer shadow-sm hover:shadow-md">
                        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">GUIDE</p>
                        <h3 className="mt-4 text-sm font-medium text-slate-900 leading-relaxed">
                          How to invoice clients professionally
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          Best practices to ensure faster payments and better communication.
                        </p>
                      </div>
                
                      <div className="border border-slate-200 p-6 bg-white hover:bg-slate-50 transition-colors duration-150 cursor-pointer shadow-sm hover:shadow-md">
                        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">TIPS</p>
                        <h3 className="mt-4 text-sm font-medium text-slate-900 leading-relaxed">
                          5 ways to get paid faster as a freelancer
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          Simple strategies that improve your cash flow instantly.
                        </p>
                      </div>
                
                      <div className="border border-slate-200 p-6 bg-white hover:bg-slate-50 transition-colors duration-150 cursor-pointer shadow-sm hover:shadow-md">
                        <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">INSIGHTS</p>
                        <h3 className="mt-4 text-sm font-medium text-slate-900 leading-relaxed">
                          Why clean invoices improve client trust
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                          How presentation directly impacts how quickly you get paid.
                        </p>
                      </div>
                
                    </div>
                  </div>
                </section>
            </main>

            {/* CTA Section */}
            <section className="bg-brand-base relative border-t border-slate-200">
              {/* Optional: Add same background texture here for consistency, or omit. I'll include it. */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px', maskImage: 'linear-gradient(to bottom, white, transparent)' }}></div>
              
              <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
                  <div className="border-l border-white/20 h-full absolute left-0" />
                  <div className="border-l border-white/20 h-full absolute right-0" />
                </div>

                <div className="text-center max-w-2xl mx-auto py-20 relative z-10">
                  <h2 className="text-4xl font-semibold text-white tracking-tight">
                    Invoice-quality tracking without the complexity
                  </h2>
                  <p className="text-white/70 mt-4 text-[17px] leading-relaxed">
                    Start billing your clients professionally today. Get paid faster and spend less time managing invoices.
                  </p>
                  <Link to="/signup">
                    <button className="bg-white text-pink-600 font-semibold px-8 py-3.5 rounded-none hover:-translate-y-[1px] hover:bg-gray-100 transition-all duration-200 mt-8 tracking-tight shadow-sm">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Footer Grid */}
            <footer className="bg-brand-base relative border-t border-white/20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative py-16">
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
                      <div className="border-l border-white/20 h-full absolute left-0" />
                      <div className="border-l border-white/20 h-full absolute right-0" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {/* Column 1 */}
                        <div className="col-span-1">
                             <div className="flex items-center gap-2 mb-4">
                                    <LogoIcon className="w-6 h-6 text-white" strokeWidth={6} />
                                    <span className="font-semibold text-lg tracking-tight text-white">Swift Invoice</span>
                             </div>
                             <p className="text-white/70 text-sm leading-relaxed mb-6">
                                Simple, structured billing for independent professionals.
                             </p>
                             <Link to="/signup">
                               <button className="bg-white/10 border border-white/20 text-white font-semibold px-4 py-2 text-xs uppercase tracking-widest rounded-none hover:-translate-y-[1px] hover:bg-white/20 transition-all duration-200 shadow-sm">Contact Us</button>
                             </Link>
                        </div>
                        
                        {/* Column 2 */}
                        <div className="col-span-1">
                             <h4 className="font-semibold mb-6 text-sm tracking-tight text-white">Product</h4>
                             <ul className="space-y-4 text-sm text-white/70">
                                 <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Documentation &rarr;</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Changelog &rarr;</a></li>
                             </ul>
                        </div>
                        
                        {/* Column 3 */}
                        <div className="col-span-1">
                             <h4 className="font-semibold mb-6 text-sm tracking-tight text-white">Company</h4>
                             <ul className="space-y-4 text-sm text-white/70">
                                 <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Careers &rarr;</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Contact &rarr;</a></li>
                             </ul>
                        </div>
                        
                        {/* Column 4 */}
                        <div className="col-span-1">
                             <h4 className="font-semibold mb-6 text-sm tracking-tight text-white">Resources / Legal</h4>
                             <ul className="space-y-4 text-sm text-white/70">
                                 <li><a href="#" className="hover:text-white transition-colors">Community &rarr;</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Support &rarr;</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                 <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                             </ul>
                        </div>
                    </div>
                </div>

                {/* Footer bottom bar */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 border-t border-white/20">
                    <div className="flex flex-col md:flex-row justify-between items-center pt-6 pb-6 text-sm text-white/60">
                        <div className="font-medium mb-4 md:mb-0">© {new Date().getFullYear()} Swift Invoice Inc. All rights reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Twitter (X)</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
