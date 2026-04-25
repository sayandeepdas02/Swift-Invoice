import React from 'react';

/**
 * Broadened SectionWrapper.
 * Preserves the chanhdai-style rulers (border-x), horizontal hairlines (screen-line-top),
 * and outer margins, but expands the inner content to 90% of the screen width for a premium, expansive SaaS feel.
 */
export const SectionWrapper = ({
  id,
  label,
  children,
  className = '',
  innerClassName = '',
  borderTop = true,
}) => {
  return (
    <section id={id} className={`w-full overflow-x-hidden bg-background px-2 sm:px-4 lg:px-[5%] ${className}`}>
      <div 
        className={`${borderTop ? 'screen-line-top' : ''} mx-auto w-full max-w-[1600px] border-x ${innerClassName}`}
        style={{ borderColor: 'var(--color-line)' }}
      >
        <div className="px-6 sm:px-12 md:px-16 lg:px-24 py-12 md:py-16">
          {children}
        </div>
      </div>
    </section>
  );
};

export default SectionWrapper;
