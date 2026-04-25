import { motion } from "framer-motion";
import React, { useCallback } from "react";

export function ShimmeringText({
  text,
  duration = 1.5,
  isStopped = false,
  className = "",
  ...props
}) {
  const createCharVariants = useCallback(
    (charIndex) => ({
      running: {
        color: ["var(--color)", "var(--shimmering-color)", "var(--color)"],
        transition: {
          duration,
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: text.length * 0.05,
          delay: (charIndex * duration) / text.length,
          ease: "easeInOut",
        },
      },
      stopped: {
        color: "var(--color)",
        transition: {
          duration: duration * 0.5,
          ease: "easeOut",
        },
      },
    }),
    [duration, text.length]
  );

  return (
    <motion.span
      className={`inline-block select-none ${className}`}
      style={{
        "--color": "var(--color-muted-foreground)",
        "--shimmering-color": "var(--color-foreground)",
      }}
      {...props}
    >
      {text?.split("")?.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial="stopped"
          animate={isStopped ? "stopped" : "running"}
          variants={createCharVariants(i)}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default ShimmeringText;
