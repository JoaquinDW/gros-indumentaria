"use client"

interface GrosBackgroundPatternProps {
  opacity?: number
}

export function GrosBackgroundPattern({
  opacity = 0.12,
}: GrosBackgroundPatternProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute w-full h-full" style={{ opacity }}>
        <defs>
          <pattern
            id="gros-dot-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="20"
              cy="20"
              r="1.5"
              fill="rgba(196, 58, 47, 1)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gros-dot-grid)" />
      </svg>
    </div>
  )
}

