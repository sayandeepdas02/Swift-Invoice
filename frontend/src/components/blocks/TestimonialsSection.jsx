import React from 'react';
import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';

/* ── Testimonial data — Swift Invoice specific ── */
const testimonials = [
  {
    text: "Swift Invoice cut our billing time from hours to minutes. Clean, fast, and exactly what we needed.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Riya Sharma",
    role: "Product Lead",
  },
  {
    text: "We stopped chasing clients for payments. The automation alone is worth every rupee. Invoicing done right.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Arjun Mehta",
    role: "Freelance Designer",
  },
  {
    text: "Clean, fast, reliable — exactly what invoicing should feel like. Our clients notice the difference.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Priya Nair",
    role: "Founder, Pixelcraft",
  },
  {
    text: "Swift Invoice feels like I finally hired an accountant. It handles the awkward money conversations for me.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    name: "Vikram Das",
    role: "Independent Consultant",
  },
  {
    text: "Setup took under 5 minutes. I sent my first branded invoice the same day. Genuinely impressive product.",
    image: "https://randomuser.me/api/portraits/women/21.jpg",
    name: "Sneha Kapoor",
    role: "UX Designer",
  },
  {
    text: "The automatic reminders are a game changer. Payment timelines improved by 40% in the first month.",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
    name: "Rahul Verma",
    role: "Agency Owner",
  },
  {
    text: "Our team switched from spreadsheets to Swift Invoice in a day. No one looked back. Highly recommend.",
    image: "https://randomuser.me/api/portraits/women/10.jpg",
    name: "Aisha Khan",
    role: "Operations Manager",
  },
  {
    text: "Best invoicing tool I've used. The interface is minimal but powerful — every feature is where you'd expect it.",
    image: "https://randomuser.me/api/portraits/men/18.jpg",
    name: "Kunal Bose",
    role: "Software Freelancer",
  },
  {
    text: "Swift Invoice helped us look more professional. Clients trust us more when they receive a polished invoice.",
    image: "https://randomuser.me/api/portraits/women/55.jpg",
    name: "Tanvi Joshi",
    role: "Marketing Consultant",
  },
];

const firstColumn  = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn  = testimonials.slice(6, 9);

/* ── Single animated column ── */
const TestimonialsColumn = ({ testimonials, duration = 15, className = '' }) => (
  <div className={`overflow-hidden ${className}`}>
    <motion.div
      animate={{ translateY: '-50%' }}
      transition={{ duration, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
      className="flex flex-col gap-4"
    >
      {[0, 1].map((pass) => (
        <React.Fragment key={pass}>
          {testimonials.map(({ text, image, name, role }, i) => (
            <div
              key={`${pass}-${i}`}
              className="flex flex-col gap-4 p-6 border bg-background"
              style={{ borderColor: 'var(--color-line)' }}
            >
              {/* Quote */}
              <p className="text-sm text-foreground leading-relaxed font-medium">
                "{text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-line)' }}>
                <img
                  src={image}
                  alt={name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-sm object-cover flex-shrink-0"
                />
                <div>
                  <div className="text-xs font-semibold tracking-tight text-foreground font-heading">{name}</div>
                  <div className="font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

/* ── Section ── */
const TestimonialsSection = () => (
  <SectionWrapper id="testimonials">

    {/* Header */}
    <div className="mb-8 border-b pb-8" style={{ borderColor: 'var(--color-line)' }}>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] text-foreground font-heading"
      >
        Trusted by professionals<br className="hidden sm:block" /> who value their time.
      </motion.h2>
    </div>

    {/* Scrolling columns — fade top & bottom */}
    <div
      className="flex gap-4 overflow-hidden"
      style={{
        maxHeight: '520px',
        maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
      }}
    >
      <TestimonialsColumn testimonials={firstColumn}  duration={18} className="flex-1" />
      <TestimonialsColumn testimonials={secondColumn} duration={22} className="flex-1 hidden md:block" />
      <TestimonialsColumn testimonials={thirdColumn}  duration={20} className="flex-1 hidden lg:block" />
    </div>

  </SectionWrapper>
);

export default TestimonialsSection;
