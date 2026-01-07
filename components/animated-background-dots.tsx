"use client";

import { motion } from "framer-motion";

interface AnimatedBackgroundDotsProps {
  color?: string;
  opacity?: number;
  density?: "low" | "medium" | "high";
}

export function AnimatedBackgroundDots({
  color = "#999999",
  opacity = 0.15,
  density = "medium",
}: AnimatedBackgroundDotsProps) {
  // Configurar densidad de dots
  const dotCounts = {
    low: 20,
    medium: 40,
    high: 60,
  };

  const dotCount = dotCounts[density];

  // Generar posiciones aleatorias para los dots
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // % position
    y: Math.random() * 100,
    size: Math.random() * 16 + 12, // 12-28px (más grandes)
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15, // 15-25s
    distance: Math.random() * 100 + 50, // 50-150px
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: color,
            opacity: opacity,
          }}
          animate={{
            y: [-dot.distance, dot.distance, -dot.distance],
            x: [
              -dot.distance / 2,
              dot.distance / 2,
              -dot.distance / 2,
            ],
            scale: [1, 1.2, 1],
            opacity: [opacity, opacity * 1.5, opacity],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Variante con patrón de grid animado
export function AnimatedGridPattern({
  color = "#999999",
  opacity = 0.1,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full">
        <defs>
          <pattern
            id="grid-pattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <motion.circle
              cx="20"
              cy="20"
              r="2"
              fill={color}
              initial={{ opacity }}
              animate={{
                opacity: [opacity, opacity * 2, opacity],
                r: [2, 3, 2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    </div>
  );
}
