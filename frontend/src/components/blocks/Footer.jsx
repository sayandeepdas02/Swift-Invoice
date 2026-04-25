import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '../ui/LogoIcon';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = {
    Product: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Changelog', href: '#' },
    ],
    Company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press', href: '#' },
    ],
    Connect: [
      { label: '𝕏  X.com', href: '#' },
      { label: '📷  Instagram', href: '#' },
      { label: '💼  LinkedIn', href: '#' },
      { label: '🐙  GitHub', href: '#' },
    ],
    'Contact Info': [
      { label: 'Email: hello@swiftinvoice.com', href: 'mailto:hello@swiftinvoice.com', plain: true },
      { label: 'Phone: +1 (555) 123-4567', href: 'tel:+15551234567', plain: true },
      { label: 'San Francisco, CA 94107, USA', href: '#', plain: true },
    ],
  };

  return (
    <footer className="w-full overflow-x-hidden bg-[#0f1117] px-2 sm:px-4 lg:px-[5%] pb-2">
      <div
        className="mx-auto w-full max-w-[1600px] border-x"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Separator */}
        <div className="w-full border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Main footer grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-10 sm:gap-8 px-6 sm:px-12 md:px-16 lg:px-24 pt-12 sm:pt-16 pb-12">

          {/* Brand column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group transition-transform active:scale-[0.98]">
              <LogoIcon className="h-8 w-auto" />
              <span className="text-lg sm:text-xl font-bold tracking-tighter text-white font-heading mt-0.5">
                Swift Invoice<span className="text-brand">.</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Swift Invoice is an invoicing platform that helps freelancers & small teams create invoices, automate reminders, and get paid faster.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([col, items]) => (
            <div key={col} className="col-span-1">
              <h4 className="mb-4 text-xs font-semibold tracking-widest uppercase text-white/80 font-heading">{col}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className={`text-sm font-medium transition-colors hover:text-white ${item.plain ? 'text-white/50' : 'text-white/40'}`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-12 md:px-16 lg:px-24 py-5"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="font-mono text-xs text-white/30">
            © {year} Swift Invoice Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((s) => (
              <a key={s} href="#" className="font-mono text-xs text-white/30 transition-colors hover:text-white/60">
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Giant watermark text */}
        <div className="overflow-hidden px-6 sm:px-12 md:px-16 lg:px-24 pb-4">
          <div
            className="text-[clamp(4rem,12vw,14rem)] font-bold tracking-tighter leading-none text-transparent font-heading select-none whitespace-nowrap"
            style={{
              WebkitTextStroke: '1.5px rgba(225, 29, 72, 0.15)',
            }}
          >
            SWIFT INVOICE
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
