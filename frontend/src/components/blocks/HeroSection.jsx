import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ShimmeringText from '../ui/ShimmeringText';

const HeroSection = () => {
  return (
    <section id="hero" className="w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%] pt-10">
      <div className="screen-line-top mx-auto w-full max-w-[1600px] border-x"
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="relative border-b" style={{ borderColor: 'var(--color-line)' }}>
          {/* dot-grid texture */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(var(--pattern-foreground) 1px, transparent 0)',
              backgroundSize: '15px 15px',
              backgroundPosition: 'center',
              '--pattern-foreground': 'color-mix(in oklab, var(--color-foreground) 8%, transparent)'
            }}
          />

          <div className="relative z-10 mx-auto w-full px-6 sm:px-12 md:px-16 lg:px-24 pt-16 pb-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Column: Typography */}
              <div className="flex flex-col items-start text-left">
                {/* Announcement badge */}
                <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-sm border bg-muted/30 px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="size-1.5 rounded-full bg-brand flex-shrink-0 animate-pulse" />
                  <ShimmeringText text="THE NEW STANDARD" duration={3} />
                </div>

                {/* H1 */}
                <h1 className="animate-fade-in-up animate-delay-100 text-balance text-5xl font-bold tracking-tighter leading-[1.05] text-foreground sm:text-6xl lg:text-7xl mb-8 font-heading">
                  Stop chasing payments. <br />
                  <span className="text-muted-foreground">Start getting paid.</span>
                </h1>

                {/* Subheadline */}
                <div className="animate-fade-in-up animate-delay-200 text-lg md:text-xl text-balance mb-10 max-w-xl leading-relaxed text-muted-foreground font-normal">
                  Create professional invoices in seconds, automate follow-ups, and get paid — without the manual work.
                </div>

                {/* CTAs */}
                <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-8">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <button className="btn-brand h-12 px-8 text-sm font-medium shadow-sm w-full sm:w-auto flex justify-center items-center gap-2">
                      Get started free
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                  <button
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-dark h-12 px-8 text-sm font-medium w-full sm:w-auto flex justify-center items-center"
                  >
                    See how it works
                  </button>
                </div>


              </div>

              {/* Right Column: Real Dashboard Screenshot */}
              <div className="hidden lg:block relative">
                <div className="relative rounded-sm overflow-hidden border shadow-2xl shadow-brand/5"
                  style={{ borderColor: 'var(--color-line)' }}
                >
                  <img
                    src="/hero-dashboard.png"
                    alt="Swift Invoice Dashboard — Revenue overview, invoice tracking, and payment analytics"
                    className="w-full h-auto object-cover"
                  />
                </div>

                {/* Floating accent — subtle brand glow behind the image */}
                <div className="absolute -inset-4 -z-10 rounded-lg bg-brand/5 blur-2xl" />
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
