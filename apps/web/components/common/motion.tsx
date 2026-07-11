"use client";
/**
 * Motion primitive components.
 * Uses tokens from lib/motion.ts — never inline easing/duration values here.
 * Respects prefers-reduced-motion at the component level.
 */
import { motion, useInView, useReducedMotion } from "framer-motion";
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

// Re-export motion primitive for direct use
export { motion };
