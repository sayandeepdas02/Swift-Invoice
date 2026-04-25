import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';

const BottomCTA = () => (
  /* Outer shell: exactly matches every other section — same px, same border-x grid */
  <section className="w-full overflow-x-hidden bg-brand px-2 sm:px-4 lg:px-[5%]">
    <div
      className="screen-line-top screen-line-bottom mx-auto w-full max-w-[1600px] border-x relative"
      style={{ borderColor: 'rgba(255,255,255,0.2)' }}
    >
      {/* Corner markers at the border-x edges */}
      <Plus className="absolute top-[-10px] left-[-10px] z-10 size-5 text-white/40" strokeWidth={1.5} />
      <Plus className="absolute top-[-10px] right-[-10px] z-10 size-5 text-white/40" strokeWidth={1.5} />
      <Plus className="absolute bottom-[-10px] left-[-10px] z-10 size-5 text-white/40" strokeWidth={1.5} />
      <Plus className="absolute bottom-[-10px] right-[-10px] z-10 size-5 text-white/40" strokeWidth={1.5} />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(60% 100% at 50% 0%, rgba(255,255,255,0.12), transparent)' }}
      />

      {/* Dashed center line */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-full border-l border-dashed"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      />

      {/* Content — same horizontal padding as all other sections */}
      <div className="relative z-10 px-6 sm:px-12 md:px-16 lg:px-24 py-14 sm:py-20 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] font-semibold text-white/80 uppercase tracking-widest mb-6 rounded-sm backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-white flex-shrink-0 animate-pulse" />
          Free forever — no credit card
        </div>

        {/* Headline */}
        <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter leading-[1.05] text-white mb-4 font-heading">
          Stop wasting time.
          <br />
          <span className="text-white/65">Start getting paid.</span>
        </h2>

        {/* Subtext */}
        <p className="text-sm sm:text-base text-white/65 leading-relaxed mb-8 max-w-md">
          Create your first invoice in under 60 seconds. No setup, no learning curve, no surprises.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link to="/signup">
            <button className="px-7 py-3 bg-white text-brand font-medium text-sm rounded-sm hover:bg-white/90 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-black/10">
              Get started free
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </Link>
          <Link to="#pricing">
            <button className="px-7 py-3 bg-transparent text-white font-medium text-sm rounded-sm border border-white/25 hover:border-white/50 hover:bg-white/5 active:scale-[0.98] transition-all">
              See pricing →
            </button>
          </Link>
        </div>

        {/* Trust strip */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-6 border-t w-full max-w-sm"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          {['Free forever plan', '2-min setup', 'No credit card'].map((item) => (
            <span key={item} className="font-mono text-[10px] font-semibold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-white/30 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default BottomCTA;
