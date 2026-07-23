/**
 * Wave Divider Component
 * Design: Aquatic Minimalism — SVG wave pattern with musical notes
 */

interface WaveDividerProps {
  variant?: 'top' | 'bottom';
  className?: string;
}

export function WaveDivider({ variant = 'bottom', className = '' }: WaveDividerProps) {
  return (
    <svg
      className={`w-full h-24 ${className}`}
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.75 0.12 220)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="oklch(0.75 0.12 220)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Main wave path */}
      <path
        d={
          variant === 'bottom'
            ? 'M0,40 Q300,0 600,40 T1200,40 L1200,120 L0,120 Z'
            : 'M0,80 Q300,120 600,80 T1200,80 L1200,0 L0,0 Z'
        }
        fill="url(#waveGradient)"
      />

      {/* Secondary wave for depth */}
      <path
        d={
          variant === 'bottom'
            ? 'M0,60 Q300,30 600,60 T1200,60 L1200,120 L0,120 Z'
            : 'M0,60 Q300,90 600,60 T1200,60 L1200,0 L0,0 Z'
        }
        fill="oklch(0.75 0.12 220)"
        opacity="0.1"
      />

      {/* Musical notes scattered */}
      <g opacity="0.4" fill="oklch(0.75 0.12 220)">
        <text x="100" y="50" fontSize="20" fontFamily="serif">
          ♪
        </text>
        <text x="400" y="30" fontSize="24" fontFamily="serif">
          ♫
        </text>
        <text x="700" y="55" fontSize="18" fontFamily="serif">
          ♪
        </text>
        <text x="1000" y="35" fontSize="22" fontFamily="serif">
          ♫
        </text>
      </g>
    </svg>
  );
}
