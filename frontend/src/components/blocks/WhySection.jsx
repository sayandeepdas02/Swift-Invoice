import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Mini UI Mockups ── */

const InvoiceBuilderMock = () => (
  <div className="mt-6 border rounded-sm overflow-hidden bg-background" style={{ borderColor: 'var(--color-line)' }}>
    {/* Tabs */}
    <div className="flex border-b text-[10px] font-semibold" style={{ borderColor: 'var(--color-line)' }}>
      {['All Active', 'Draft', 'Sent', 'Paid', 'Overdue'].map((t, i) => (
        <div key={t} className={`px-3 py-2.5 ${i === 0 ? 'text-brand border-b-2 border-brand bg-brand/5' : 'text-muted-foreground'}`}>{t}</div>
      ))}
    </div>
    {/* Rows */}
    <div className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
      {[
        { id: 'INV-2025-0049', client: 'Acme Corporation', status: 'Paid', statusColor: 'bg-emerald-500', amount: '$1,250.00' },
        { id: 'INV-2025-0048', client: 'Bright Solutions', status: 'Sent', statusColor: 'bg-brand', amount: '$980.00' },
        { id: 'INV-2025-0047', client: 'NextGen LLC', status: 'Overdue', statusColor: 'bg-red-500', amount: '$2,400.00' },
        { id: 'INV-2025-0046', client: 'Creative Studio', status: 'Paid', statusColor: 'bg-emerald-500', amount: '$750.00' },
      ].map((row) => (
        <div key={row.id} className="flex items-center justify-between px-3 py-2.5 text-[10px]">
          <span className="font-mono text-muted-foreground w-24">{row.id}</span>
          <span className="font-medium text-foreground flex-1 ml-2">{row.client}</span>
          <span className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider`}>
            <span className={`size-1.5 rounded-full ${row.statusColor}`} />{row.status}
          </span>
          <span className="font-semibold text-foreground ml-4 w-16 text-right">{row.amount}</span>
        </div>
      ))}
    </div>
  </div>
);

const RevenueDashboardMock = () => (
  <div className="mt-6 border rounded-sm overflow-hidden bg-background p-4" style={{ borderColor: 'var(--color-line)' }}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <div className="font-mono text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Revenue</div>
        <div className="text-2xl font-bold tracking-tighter text-foreground font-heading">$24,530</div>
      </div>
      {/* Mini donut */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-line)" strokeWidth="3" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-brand)" strokeWidth="3"
            strokeDasharray="66 22" strokeLinecap="round" />
          <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
            strokeDasharray="0 66 22 0" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold text-foreground">75%</div>
      </div>
    </div>
    {/* Legend */}
    <div className="flex gap-4 text-[9px] font-semibold tracking-wider border-t pt-3" style={{ borderColor: 'var(--color-line)' }}>
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />Paid <span className="text-muted-foreground ml-1">$18,230</span></span>
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" />Pending <span className="text-muted-foreground ml-1">$4,800</span></span>
      <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-red-400" />Overdue <span className="text-muted-foreground ml-1">$1,500</span></span>
    </div>
  </div>
);

const RemindersMock = () => (
  <div className="mt-6 border rounded-sm overflow-hidden bg-background" style={{ borderColor: 'var(--color-line)' }}>
    <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-line)' }}>
      <span className="font-bold text-xs text-foreground font-heading">Reminders</span>
      <span className="text-[9px] font-semibold text-brand uppercase tracking-wider">Active ●</span>
    </div>
    <div className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
      {[
        { day: '1 day after due', label: '1st reminder', checked: true },
        { day: '3 days after due', label: '2nd reminder', checked: true },
        { day: '7 days after due', label: 'Final reminder', checked: true },
      ].map((r, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className={`size-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${r.checked ? 'bg-brand border-brand' : 'border-muted-foreground/30'}`}>
              {r.checked && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="text-[10px] font-medium text-foreground">{r.day}</span>
          </div>
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{r.label}</span>
        </div>
      ))}
    </div>
    <div className="px-4 py-2.5 bg-muted/30 text-[9px] text-muted-foreground border-t" style={{ borderColor: 'var(--color-line)' }}>
      Reminders sent to <span className="font-semibold text-foreground">billing@acmecorp.com</span>
    </div>
  </div>
);

const ClientsMock = () => (
  <div className="mt-6 flex gap-3">
    {/* Recent Payments mini card */}
    <div className="flex-1 border rounded-sm bg-background overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
      <div className="px-3 py-2 border-b text-[10px] font-semibold text-foreground font-heading" style={{ borderColor: 'var(--color-line)' }}>
        Recent Payments
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--color-line)' }}>
        {[
          { name: 'Acme Corp', amount: '+$1,250', status: 'Paid' },
          { name: 'Bright Sol.', amount: '+$980', status: 'Paid' },
          { name: 'Creative St.', amount: '+$750', status: 'Paid' },
        ].map((p, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 text-[9px]">
            <span className="font-medium text-foreground">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{p.amount}</span>
              <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-600 font-semibold text-[8px] uppercase">{p.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    {/* Pipeline mini card */}
    <div className="flex-1 border rounded-sm bg-background overflow-hidden" style={{ borderColor: 'var(--color-line)' }}>
      <div className="px-3 py-2 border-b text-[10px] font-semibold text-foreground font-heading" style={{ borderColor: 'var(--color-line)' }}>
        Cash Flow
      </div>
      <div className="px-3 py-3">
        {/* Mini bar chart */}
        <div className="flex items-end gap-1.5 h-14 mb-2">
          {[40, 55, 35, 70, 60, 85, 50].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-brand/20 relative" style={{ height: `${h}%` }}>
              <div className="absolute bottom-0 inset-x-0 rounded-sm bg-brand" style={{ height: `${h * 0.6}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
          <span>May 1</span><span>May 28</span>
        </div>
      </div>
    </div>
  </div>
);


/* ── Main Section ── */
const WhySection = () => (
  <section id="why" className="w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%]">
    <div className="screen-line-top mx-auto w-full max-w-[1600px] border-x" style={{ borderColor: 'var(--color-line)' }}>
      <div className="px-6 sm:px-12 md:px-16 lg:px-24 py-12 md:py-16">

        {/* ── Centered Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 border bg-muted/30 px-3 py-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 rounded-sm mx-auto"
            style={{ borderColor: 'var(--color-line)' }}>
            <span className="size-1.5 rounded-full bg-brand flex-shrink-0" />
            Why Swift Invoice?
          </div>
          <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.05] text-foreground font-heading mb-4">
            Get paid faster. Work smarter.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Effortlessly create, send, and track invoices with real-time analytics and automated reminders to ensure a smooth cash flow.
          </p>
        </motion.div>

        {/* ── Bento Grid: 2 rows ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Card 1: Invoice Management — top left */}
          <motion.div
            custom={0} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
            className="border rounded-sm p-6 sm:p-8 bg-muted/5 hover:bg-muted/10 transition-colors"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-heading mb-2">
              Smart Invoice Management
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Track every invoice from creation to payment with real-time status updates. Filter by paid, sent, overdue — all in one view.
            </p>
            <InvoiceBuilderMock />
          </motion.div>

          {/* Card 2: Revenue Dashboard — top right */}
          <motion.div
            custom={1} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
            className="border rounded-sm p-6 sm:p-8 bg-muted/5 hover:bg-muted/10 transition-colors"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-heading mb-2">
              Real-Time Revenue Analytics
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Understand your cash position at a glance. Revenue breakdowns, payment ratios, and trends — no spreadsheets required.
            </p>
            <RevenueDashboardMock />
          </motion.div>

          {/* Card 3: Automated Reminders — bottom left */}
          <motion.div
            custom={2} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
            className="border rounded-sm p-6 sm:p-8 bg-muted/5 hover:bg-muted/10 transition-colors"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-heading mb-2">
              Automated Payment Reminders
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Set it and forget it. Automatic reminders chase payments for you — politely, persistently, and on schedule.
            </p>
            <RemindersMock />
          </motion.div>

          {/* Card 4: Client & Cash Flow — bottom right */}
          <motion.div
            custom={3} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}
            className="border rounded-sm p-6 sm:p-8 bg-muted/5 hover:bg-muted/10 transition-colors"
            style={{ borderColor: 'var(--color-line)' }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-heading mb-2">
              Payments & Cash Flow Tracking
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Monitor recent payments and visualize your cash flow trends. Know exactly where your money is, in real time.
            </p>
            <ClientsMock />
          </motion.div>

        </div>
      </div>
    </div>
  </section>
);

export default WhySection;
