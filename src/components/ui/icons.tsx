import type { SVGProps } from "react";

/** Hand-drawn-feeling line icons, 24px grid, 1.25 stroke. Decorative by default (aria-hidden). */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false,
    ...props,
  };
}

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h15M14 7l5 5-5 5" />
  </svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 12H5M10 7l-5 5 5 5" />
  </svg>
);
export const IconBag = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5.5 8.5h13l-1 11.5h-11z" />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconMinus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const IconGift = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="9" width="16" height="11" rx="1" />
    <path d="M3.5 9h17M12 9v11M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
  </svg>
);
export const IconScissors = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="6.5" cy="17" r="2.5" />
    <circle cx="17.5" cy="17" r="2.5" />
    <path d="M8.3 15.3L18 4M15.7 15.3L6 4" />
  </svg>
);
export const IconSprout = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20v-8" />
    <path d="M12 12c0-4 2.5-6.5 7-6.5 0 4.5-2.5 6.5-7 6.5z" />
    <path d="M12 14.5c0-3-2-5-5.5-5 0 3.5 2 5 5.5 5z" />
    <path d="M7 20h10" />
  </svg>
);
export const IconFlower = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9" r="2" />
    <path d="M12 7c-1-3 2-3 0 0M14 9c3-1 3 2 0 0M12 11c1 3-2 3 0 0M10 9c-3 1-3-2 0 0" />
    <path d="M12 11c.4 2.6 0 6 0 9M12 16c-1.5-1.6-3.5-2-5-1.5 1 1.8 3 2.4 5 1.5z" />
  </svg>
);
export const IconHand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 12.5V7.8a1.3 1.3 0 0 1 2.6 0V11M9.6 10.5V6.3a1.3 1.3 0 0 1 2.6 0v4.4M12.2 10.6V7a1.3 1.3 0 0 1 2.6 0v4M14.8 11.2V9a1.3 1.3 0 0 1 2.6 0v4.6c0 3.5-2.4 6.4-5.8 6.4-2.3 0-3.6-1-4.9-2.8L4.4 13.4a1.3 1.3 0 0 1 2.1-1.5L7 12.6" />
  </svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3.5" y="6" width="17" height="12" rx="1.5" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);
export const IconBook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" />
  </svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="1.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);
export const IconSun = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6" />
  </svg>
);

/** The Harlow Brook sprig mark used beside the wordmark. */
export function SprigMark({ size = 28, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden focusable={false} {...props}>
      <path d="M16 29c0-6 .4-13 4.5-20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M20.5 9c-1.6-3.3.4-6 3.6-6.2.6 3.4-1.2 5.6-3.6 6.2z" fill="currentColor" />
      <path d="M17.7 15.3c-3.4-.6-5.6-3.2-5-6.4 3.2.3 5.2 2.8 5 6.4z" fill="currentColor" opacity=".55" />
      <path d="M18.8 13.2c2.7-2 6-1.8 7.6.4-2.4 2.3-5.5 2.2-7.6-.4z" fill="currentColor" opacity=".8" />
      <path d="M16.4 21.5c-3-1.4-4.4-4.4-3.2-7.3 2.9 1.2 4.2 4 3.2 7.3z" fill="currentColor" opacity=".4" />
      <circle cx="24.6" cy="3.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

/** Fine botanical vine, used as a flourish above the navigation and beside section titles. */
export function VineFlourish({ flip = false, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 34"
      fill="none"
      aria-hidden
      focusable={false}
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M2 26c18-1 30-12 48-13s26 9 44 8 28-14 46-15c7-.4 12 1 18 4"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path d="M38 14.5c1.5-5 6-7.5 10.5-6.5-1.3 4.6-5.6 7.3-10.5 6.5z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M62 15.5c-4.2-2.6-5.5-7-3.6-10.6 4 2.3 5.4 6.6 3.6 10.6z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M90 20.5c3.4-3.8 8.3-4.6 12-2.4-3.2 3.6-8.3 4.6-12 2.4z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M118 11c-.6-4.8 2.4-8.6 6.8-9.2.5 4.7-2.5 8.4-6.8 9.2z" stroke="currentColor" strokeWidth="0.9" />
      <path d="M22 21.5c-2.8-3.4-2.6-7.6.4-10 2.6 3.3 2.4 7.7-.4 10z" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="146" cy="7.5" r="2.2" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="146" cy="7.5" r="0.7" fill="currentColor" />
      <circle cx="74" cy="13.2" r="1.4" fill="currentColor" />
    </svg>
  );
}
