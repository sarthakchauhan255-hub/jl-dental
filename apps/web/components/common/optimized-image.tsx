"use client";
/**
 * OptimizedImage — next/image with graceful fallback.
 * Never shows broken image icons — falls back to branded placeholder.
 * All content images must use this instead of raw next/image.
 */
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getBrandAssets } from "@/config/branding";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string;
  containerClassName?: string;
  aspectRatio?: "1/1" | "4/3" | "3/4" | "16/9" | "3/2";
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackClassName,
  containerClassName,
  aspectRatio,
  fill,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  const aspectClass = aspectRatio ? {
    "1/1":  "aspect-square",
    "4/3":  "aspect-[4/3]",
    "3/4":  "aspect-[3/4]",
    "16/9": "aspect-video",
    "3/2":  "aspect-[3/2]",
  }[aspectRatio] : undefined;

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-charcoal-100",
          aspectClass,
          fill ? "absolute inset-0" : "",
          fallbackClassName,
          containerClassName
        )}
        role="img"
        aria-label={alt}
      >
        <span className="font-display text-sm font-medium text-charcoal-400 select-none">
          {getBrandAssets().shortName}
        </span>
      </div>
    );
  }

  const imageEl = (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => setError(true)}
      {...props}
    />
  );

  if (fill) return imageEl;

  return (
    <div className={cn("relative overflow-hidden", aspectClass, containerClassName)}>
      {imageEl}
    </div>
  );
}
