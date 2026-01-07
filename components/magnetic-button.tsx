"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { Button } from "@/components/ui/button";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  magneticStrength?: number;
  glow?: boolean;
}

export function MagneticButton({
  children,
  className = "",
  onClick,
  variant = "default",
  size = "default",
  magneticStrength = 0.3,
  glow = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * magneticStrength;
    const distanceY = (e.clientY - centerY) * magneticStrength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowClass = glow
    ? "relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[var(--gros-red)] before:to-[var(--gros-maroon)] before:blur-xl before:opacity-0 hover:before:opacity-50 before:transition-opacity before:duration-500 before:-z-10"
    : "";

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className={`inline-block ${glowClass}`}
    >
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={`relative overflow-hidden ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        asChild
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <span className="relative z-10">{children}</span>

          {/* Ripple effect overlay */}
          <motion.span
            className="absolute inset-0 bg-white/20"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 2, opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>
      </Button>
    </motion.div>
  );
}

// Simpler button with just hover effects
export function AnimatedButton({
  children,
  className = "",
  onClick,
  variant = "default",
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  glow?: boolean;
}) {
  const glowClass = glow
    ? "relative before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-r before:from-[var(--gros-red)] before:to-[var(--gros-maroon)] before:blur-xl before:opacity-0 hover:before:opacity-50 before:transition-opacity before:duration-500 before:-z-10"
    : "";

  return (
    <motion.div className={glowClass}>
      <Button
        variant={variant}
        className={className}
        onClick={onClick}
        asChild
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(196, 58, 47, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {children}
        </motion.button>
      </Button>
    </motion.div>
  );
}
