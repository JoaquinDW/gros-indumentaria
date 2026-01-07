"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";
import { viewportSettings } from "@/lib/animations";

interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function ScrollReveal({
  children,
  variants,
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants || defaultVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
