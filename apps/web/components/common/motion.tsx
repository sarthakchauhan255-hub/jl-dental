"use client";
/**
 * Motion primitive components.
 * Uses tokens from lib/motion.ts — never inline easing/duration values here.
 * Respects prefers-reduced-motion at the component level.
 */
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef }                               from "react";
import { variants, stagger }                    from "@/lib/motion";

// ─── Scroll-reveal wrapper ───────────────────────────────────────────────────
interface RevealProps {
  children:    React.ReactNode;
  variant?:    keyof Omit<typeof variants, "staggerContainer">;
  className?:  string;
  delay?:      number;
  threshold?:  number;
}

/**
 * Reveal — fade-up (or other variant) when element enters viewport.
 * Fires once. Respects reduced-motion (instant show).
 */
export function Reveal({
  children,
  variant = "fadeUp",
  className,
  delay = 0,
  threshold = 0.1,
}: RevealProps) {
  const ref          = useRef<HTMLDivElement>(null);
  const inView       = useInView(ref, { once: true, margin: "0px" });
  const reducedMotion = useReducedMotion();

  const selectedVariant = variants[variant];

  return (
    <motion.div
      ref={ref}
      variants={selectedVariant}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={reducedMotion || inView ? "visible" : "hidden"}
      transition={delay ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Staggered container ────────────────────────────────────────────────────
interface StaggerRevealProps {
  children:     React.ReactNode;
  className?:   string;
  staggerDelay?: keyof typeof stagger;
}

/**
 * StaggerReveal — triggers staggered animation on children.
 * Children should be wrapped in <Reveal> or motion.* elements.
 */
export function StaggerReveal({
  children,
  className,
  staggerDelay = "cards",
}: StaggerRevealProps) {
  const ref           = useRef<HTMLDivElement>(null);
  const inView        = useInView(ref, { once: true, margin: "-50px" });
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={variants.staggerContainer(stagger[staggerDelay] as number)}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={reducedMotion || inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Hover card wrapper ─────────────────────────────────────────────────────
export function HoverCard({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reducedMotion ? {} : { y: -2, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
    >
      {children}
    </motion.div>
  );
}

// ─── Scroll-linked fade (position-driven) ────────────────────────────────────
interface ScrollFadeProps {
  children:   React.ReactNode;
  className?: string;
  /** Rise distance (px) for the card entering from below (default 48). */
  rise?:      number;
  /** Opacity floor at the extremes — lower = stronger fade (default 0.04). */
  floor?:     number;
}

/**
 * ScrollFade — opacity + drift driven by the element's position in the viewport.
 * Narrow crisp window in the centre; strong fade elsewhere.
 *  • Entering (from below): fade in + rise, at full size.
 *  • Leaving  (at the top):  fade out + shrink, receding into the background.
 * Continuous and reverses on scroll. Respects reduced-motion (static, visible).
 */
export function ScrollFade({ children, className, rise = 48, floor = 0.04 }: ScrollFadeProps) {
  const ref           = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [floor, 1, 1, floor]);
  // Enter rises from below; leave drifts up only slightly (shrink carries it back).
  const y       = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [rise, 0, 0, -16]);
  // No shrink on entry (stays 1); shrink only as it leaves the top.
  const scale   = useTransform(scrollYProgress, [0, 0.42, 0.58, 1], [1, 1, 1, 0.8]);

  if (reducedMotion) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ opacity, y, scale }} className={className}>
      {children}
    </motion.div>
  );
}

// Re-export motion primitive for direct use
export { motion };
