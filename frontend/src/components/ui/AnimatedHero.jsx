import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "./Button";

export function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Freelancers", "Founders", "Builders"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-brand-base relative flex flex-col items-center pt-0 pb-0 overflow-hidden">

      {/* Decorative Grid Top Pattern */}
      <div className="absolute top-0 inset-x-0 h-[250px] z-0"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px', maskImage: 'linear-gradient(to bottom, white, transparent)' }}>
      </div>

      {/* Master central grid boundary inside the Hero */}
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative z-10 h-full flex flex-col items-center justify-center pt-12 pb-16">

        {/* Continuous Internal Grid Lines */}
        <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
          <div className="border-l border-white/20 h-full absolute left-0" />
          <div className="border-l border-white/20 h-full absolute right-0" />
        </div>

        {/* Content Wrapper */}
        <div className="max-w-3xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Top pill */}
          <div className="mb-10 px-4 py-1.5 border border-white/20 rounded-sm text-[11px] font-semibold text-white/90 tracking-wide bg-white/5 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors shadow-sm">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)] animate-pulse"></div>
            Announcing Swift Invoice 2.0
          </div>

          {/* H1 Titles */}
          <div className="flex flex-col items-center justify-center w-full text-center mt-16">
            <h1 className="text-5xl md:text-[56px] font-bold tracking-tight text-white mb-2 leading-[1.1] md:leading-[1.15]">
              Simple, Commercial-Quality<br />
              <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-1 mt-1">
                <span>Invoicing for</span>
                <span className="relative flex w-[280px] md:w-[320px] justify-center overflow-hidden h-[1.25em]">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={titleNumber}
                      className="absolute text-white block font-semibold italic"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.3 }}
                    >
                      {titles[titleNumber]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </h1>

            <p className="text-[20px] text-white/80 max-w-2xl leading-relaxed mt-4 font-medium tracking-tight">
              You want faster billing, not the burden of complex ERPs.
              <br className="hidden md:block" />
              Swift Invoice is the modern Stripe alternative built as a pure web app.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-20 items-center justify-center w-full">
            <Link to="/signup">
              <button className="bg-white text-brand-base font-semibold px-8 py-3.5 rounded-sm duration-150 transition-all hover:-translate-y-[1px] hover:bg-[#BE123C] hover:text-white text-sm tracking-tight shadow-sm">
                Get Started
              </button>
            </Link>
          </div>

          {/* Bottom Wave Pattern mimicking ParadeDB */}
          <div className="absolute bottom-0 inset-x-0 h-[100px] z-0 opacity-[0.2]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px', maskImage: 'linear-gradient(to top, white, transparent)' }}>
          </div>
        </div>
      </div>

      {/* Logos Grid Area (Below the main section, stretching width of internal border) */}
      <div className="w-full relative z-10 border-t border-white/20">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="absolute inset-0 pointer-events-none hidden md:block z-0">
            <div className="border-l border-white/20 h-full absolute left-0" />
            <div className="border-l border-white/20 h-full absolute right-0" />
          </div>
          <div className="py-12 flex justify-between items-center opacity-80 flex-wrap gap-8 relative z-10">
            <div className="font-bold text-2xl tracking-[0.2em] text-white/90">T E S L A</div>
            <div className="font-bold text-xl tracking-tight text-white/90 flex items-center gap-1 font-sans">MODERN TREASURY</div>
            <div className="font-bold text-2xl text-white/90 italic font-serif">Alibaba</div>
            <div className="font-bold text-xl text-white/90 lowercase font-mono">span.</div>
            <div className="font-bold text-lg text-white/90 font-serif italic">demandscience</div>
          </div>
        </div>
      </div>
    </div>
  );
}
