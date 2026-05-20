/**
 * Ilustración SVG propia: movilidad / conducción / aprendizaje.
 * Se muestra en el panel izquierdo del layout de autenticación (desktop).
 */
export function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 480 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-auto w-full max-w-md"
      aria-hidden
    >
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="auth-road" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="auth-car" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDE9FE" />
        </linearGradient>
        <linearGradient id="auth-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Sky glow */}
      <ellipse cx="240" cy="120" rx="200" ry="100" fill="url(#auth-sky)" />

      {/* Road */}
      <path
        d="M0 320 Q120 280 240 300 T480 320 L480 400 L0 400 Z"
        fill="url(#auth-road)"
        opacity="0.35"
      />
      <path d="M60 310 L420 310" stroke="white" strokeWidth="3" strokeDasharray="16 12" opacity="0.5" />

      {/* Traffic sign */}
      <rect x="72" y="168" width="8" height="100" rx="2" fill="white" opacity="0.7" />
      <polygon points="76,148 108,168 44,168" fill="url(#auth-accent)" opacity="0.95" />
      <text x="76" y="162" textAnchor="middle" fill="#78350F" fontSize="14" fontWeight="bold">
        !
      </text>

      {/* Car body */}
      <g transform="translate(140, 210)">
        <rect x="0" y="40" width="200" height="56" rx="12" fill="url(#auth-car)" />
        <path
          d="M24 40 L48 8 L152 8 L176 40 Z"
          fill="url(#auth-car)"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.6"
        />
        <rect x="52" y="16" width="48" height="28" rx="4" fill="#C4B5FD" opacity="0.5" />
        <rect x="108" y="16" width="48" height="28" rx="4" fill="#C4B5FD" opacity="0.5" />
        {/* Wheels */}
        <circle cx="48" cy="96" r="22" fill="#2E1065" />
        <circle cx="48" cy="96" r="12" fill="#A78BFA" />
        <circle cx="152" cy="96" r="22" fill="#2E1065" />
        <circle cx="152" cy="96" r="12" fill="#A78BFA" />
        {/* Headlight */}
        <ellipse cx="196" cy="64" rx="8" ry="6" fill="url(#auth-accent)" opacity="0.9" />
      </g>

      {/* Steering wheel icon (learning) */}
      <g transform="translate(340, 80)" opacity="0.9">
        <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="4" fill="none" opacity="0.5" />
        <circle cx="40" cy="40" r="10" fill="white" opacity="0.8" />
        <line x1="40" y1="4" x2="40" y2="20" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="40" y1="60" x2="40" y2="76" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="4" y1="40" x2="20" y2="40" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="60" y1="40" x2="76" y2="40" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      </g>

      {/* Floating dots */}
      <circle cx="400" cy="60" r="6" fill="#FBBF24" opacity="0.8" />
      <circle cx="48" cy="80" r="4" fill="white" opacity="0.5" />
      <circle cx="420" cy="200" r="5" fill="#A78BFA" opacity="0.6" />
    </svg>
  );
}
