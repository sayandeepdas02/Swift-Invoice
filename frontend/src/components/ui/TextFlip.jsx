import { AnimatePresence, motion } from "framer-motion";
import React, { Children, useEffect, useState } from "react";

const defaultVariants = {
  initial: { y: -8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 8, opacity: 0 },
};

export function TextFlip({
  as: Component = motion.span,
  className = "",
  children,
  interval = 2,
  transition = { duration: 0.3 },
  variants = defaultVariants,
  onIndexChange,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = Children.toArray(children);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Component
        key={currentIndex}
        className={`inline-block ${className}`}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        variants={variants}
      >
        {items[currentIndex]}
      </Component>
    </AnimatePresence>
  );
}

export default TextFlip;
