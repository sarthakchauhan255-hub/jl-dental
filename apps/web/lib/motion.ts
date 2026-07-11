/**
 * Motion design tokens — single source of truth for all animation values.
 *
 * Rules:
 * - Import from here, never inline easing/duration values
 * - All Framer Motion transitions use these tokens
 * - CSS animations in Tailwind config mirror these values
 */
import type { Transition, Variants } from "framer-motion";

// ─── Easing curves ────────────────────────────────────────────────────────────
export const ease = {
  /** Primary — fast start, elegant deceleration. Use for most reveals. */
  outExpo:   [0.16, 1, 0.3, 1]    as [number, number, number, number],
  /** State transitions — balanced in/out */
  inOut:     [0.4, 0, 0.2, 1]     as [number, number, number, number],
  /** Subtle spring — use sparingly (interactive elements only) */
  spring:    [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  /** Linear — shimmer and looping animations only */
  linear:    "linear"              as const,
  /** Aggressive in — use for exit animations */
  inExpo:    [0.7, 0, 0.84, 0]    as [number, number, number, number],
} as const;

// ─── Duration scale (ms) ─────────────────────────────────────────────────────
export const duration = {
  /** Immediate — focus rings, color swaps */
  instant:    0.0,
  /** Fast — hover color, icon swap */
  fast:       0.15,
  /** Normal — button press, small panel */
  normal:     0.25,
  /** Medium — dropdowns, drawers */
  medium:     0.35,
  /** Slow — scroll reveals, section entries */
  slow:       0.5,
  /** Deliberate — hero entrance, page-level */
  deliberate: 0.7,
} as const;

// ─── Stagger increments ───────────────────────────────────────────────────────
export const stagger = {
  /** Grid cards */
  cards:  0.08,
  /** List items */
  list:   0.06,
  /** Fast overlap */
  tight:  0.04,
} as const;

// ─── Shared transition presets ───────────────────────────────────────────────
export const transition = {
  /** Standard reveal */
  reveal: {
    duration: duration.slow,
    ease:     ease.outExpo,
  } satisfies Transition,

  /** Fast UI interaction */
  ui: {
    duration: duration.normal,
    ease:     ease.inOut,
  } satisfies Transition,

  /** Hover state */
  hover: {
    duration: duration.fast,
    ease:     ease.inOut,
  } satisfies Transition,

  /** Modal/dialog appear */
  modal: {
    duration: duration.medium,
    ease:     ease.outExpo,
  } satisfies Transition,
} as const;

// ─── Shared Framer Motion variant presets ────────────────────────────────────
export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: transition.reveal },
  } satisfies Variants,

  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
  } satisfies Variants,

  fadeDown: {
    hidden:  { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0, transition: transition.reveal },
  } satisfies Variants,

  scaleIn: {
    hidden:  { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: transition.modal },
  } satisfies Variants,

  slideLeft: {
    hidden:  { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: transition.reveal },
  } satisfies Variants,

  /** Container for staggered children */
  staggerContainer: (staggerAmount: number = stagger.cards): Variants => ({
    hidden:  {},
    visible: { transition: { staggerChildren: staggerAmount } },
  }),
} as const;

// ─── Reduced motion — check at runtime ───────────────────────────────────────
/**
 * Returns true if user prefers reduced motion.
 * Use to conditionally disable animations.
 * Call inside useEffect or event handlers — not during SSR.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
