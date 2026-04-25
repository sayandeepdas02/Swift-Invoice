import React from 'react';
import { Link } from 'react-router-dom';
import PixelBlast from '../ui/PixelBlast';

const BottomCTA = () => (
  <section
    className="relative w-full overflow-x-hidden px-2 sm:px-4 lg:px-[5%]"
    style={{ background: 'linear-gradient(145deg, #E11D48 0%, #BE123C 40%, #9F1239 100%)' }}
  >
    {/* PixelBlast background — subtle light pink pixels floating over the gradient */}
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-overlay opacity-60">
      <PixelBlast
        variant="square"
        pixelSize={4}
        color="#ffffff"
        patternScale={2.5}
        patternDensity={0.6}
        pixelSizeJitter={0.3}
        enableRipples
        rippleSpeed={0.3}
        rippleThickness={0.1}
        rippleIntensityScale={1}
        speed={0.3}
        edgeFade={0.2}
        transparent
      />
    </div>

    <div
      className="relative z-10 screen-line-top screen-line-bottom mx-auto w-full max-w-[1600px] border-x"
      style={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <div className="px-6 sm:px-12 md:px-16 lg:px-24 py-14 sm:py-16 flex flex-col items-center text-center">

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-white font-heading leading-tight mb-3">
          Less spreadsheets, more payments?
        </h2>

        <p className="text-sm text-white/55 leading-relaxed max-w-md mb-8">
          Create your first invoice in under 60 seconds — no setup, no credit card.
        </p>

        <Link to="/signup">
          <button className="px-8 py-2.5 bg-white text-foreground font-semibold text-sm rounded-sm hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10">
            Get Started
          </button>
        </Link>

      </div>
    </div>
  </section>
);

export default BottomCTA;
