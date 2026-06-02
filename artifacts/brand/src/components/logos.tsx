import React from 'react';

export const LogoMark = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path 
      d="M50 10C75 10 90 25 90 50C90 75 75 90 50 90C25 90 10 75 10 50C10 25 25 10 50 10Z" 
      stroke="currentColor" 
      strokeWidth="6" 
      className="text-foreground"
    />
    <path 
      d="M10 50C30 30 70 30 90 50C70 70 30 70 10 50Z" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round"
      className="text-foreground"
    />
    <circle cx="50" cy="50" r="18" stroke="#007BFF" strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill="#00D4FF" />
    <circle cx="35" cy="50" r="2" fill="#007BFF" />
    <circle cx="65" cy="50" r="2" fill="#007BFF" />
    <circle cx="50" cy="35" r="2" fill="#007BFF" />
    <circle cx="50" cy="65" r="2" fill="#007BFF" />
  </svg>
);

export const LogoWordmark = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 400 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <text 
      x="0" 
      y="45" 
      fontFamily="Space Grotesk, sans-serif" 
      fontWeight="700" 
      fontSize="48" 
      letterSpacing="0.1em" 
      fill="currentColor"
    >
      NETRAKSH
    </text>
  </svg>
);

export const LogoStacked = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col items-center gap-4 ${className}`} {...props}>
    <LogoMark className="w-24 h-24" />
    <LogoWordmark className="w-48 h-auto" />
  </div>
);

export const LogoHorizontal = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex items-center gap-4 ${className}`} {...props}>
    <LogoMark className="w-12 h-12" />
    <LogoWordmark className="w-32 h-auto" />
  </div>
);

export const LogoAppIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="120" height="120" rx="28" fill="url(#brand-gradient)" />
    <g transform="translate(20, 20) scale(0.8)">
      <path 
        d="M50 10C75 10 90 25 90 50C90 75 75 90 50 90C25 90 10 75 10 50C10 25 25 10 50 10Z" 
        stroke="white" 
        strokeWidth="6" 
      />
      <path 
        d="M10 50C30 30 70 30 90 50C70 70 30 70 10 50Z" 
        stroke="white" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="18" stroke="#00D4FF" strokeWidth="4" />
      <circle cx="50" cy="50" r="8" fill="white" />
      <circle cx="35" cy="50" r="2" fill="#00D4FF" />
      <circle cx="65" cy="50" r="2" fill="#00D4FF" />
      <circle cx="50" cy="35" r="2" fill="#00D4FF" />
      <circle cx="50" cy="65" r="2" fill="#00D4FF" />
    </g>
    <defs>
      <linearGradient id="brand-gradient" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
        <stop stopColor="#081C3A" />
        <stop offset="1" stopColor="#007BFF" />
      </linearGradient>
    </defs>
  </svg>
);

export const LogoFavicon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path 
      d="M16 4C24 4 28 8 28 16C28 24 24 28 16 28C8 28 4 24 4 16C4 8 8 4 16 4Z" 
      stroke="#007BFF" 
      strokeWidth="2.5" 
    />
    <path 
      d="M4 16C10 9 22 9 28 16C22 23 10 23 4 16Z" 
      stroke="#00D4FF" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <circle cx="16" cy="16" r="4" fill="#007BFF" />
  </svg>
);

export const LogoMonochrome = ({ className, fill = "currentColor", ...props }: React.SVGProps<SVGSVGElement> & { fill?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <path 
      d="M50 10C75 10 90 25 90 50C90 75 75 90 50 90C25 90 10 75 10 50C10 25 25 10 50 10Z" 
      stroke={fill} 
      strokeWidth="6" 
    />
    <path 
      d="M10 50C30 30 70 30 90 50C70 70 30 70 10 50Z" 
      stroke={fill} 
      strokeWidth="6" 
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="18" stroke={fill} strokeWidth="4" />
    <circle cx="50" cy="50" r="8" fill={fill} />
    <circle cx="35" cy="50" r="2" fill={fill} />
    <circle cx="65" cy="50" r="2" fill={fill} />
    <circle cx="50" cy="35" r="2" fill={fill} />
    <circle cx="50" cy="65" r="2" fill={fill} />
  </svg>
);