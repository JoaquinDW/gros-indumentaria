"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  delay?: number;
}

export function AnimatedText({
  children,
  className = "",
  gradient = false,
  delay = 0,
}: AnimatedTextProps) {
  const text = typeof children === "string" ? children : "";
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const gradientClass = gradient
    ? "bg-gradient-to-r from-[var(--gros-red)] via-[var(--gros-maroon)] to-[var(--gros-red)] bg-clip-text text-transparent animate-gradient-x"
    : "";

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={child}
          className={`inline-block mr-2 ${gradientClass}`}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Simpler version for hero titles
export function AnimatedTitle({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.h1
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.h1>
  );
}

// Gradient text with shimmer effect
export function ShimmerText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block bg-gradient-to-r from-[var(--gros-red)] via-white to-[var(--gros-red)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer ${className}`}
    >
      {children}
    </span>
  );
}
