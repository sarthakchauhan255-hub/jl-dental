"use client";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage }  from "@/components/common/optimized-image";
import { galleryImageUrl } from "@/lib/media/cloudinary-url";
import { cn } from "@/lib/utils";

interface LightboxImage { publicId: string; caption?: string }

interface GalleryLightboxProps {
  images:     LightboxImage[];
  openIndex:  number | null;
  onClose:    () => void;
  onNavigate: (index: number) => void;
}

/** Client island: keyboard nav, focus management for fullscreen overlay. */
export function GalleryLightbox({ images, openIndex, onClose, onNavigate }: GalleryLightboxProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (openIndex === null) return;
    if (e.key === "Escape")    onClose();
    if (e.key === "ArrowRight") onNavigate((openIndex + 1) % images.length);
    if (e.key === "ArrowLeft")  onNavigate((openIndex - 1 + images.length) % images.length);
  }, [openIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (openIndex === null) return null;
  const current = images[openIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      className="fixed inset-0 z-modal flex items-center justify-center bg-charcoal-950/95 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate((openIndex - 1 + images.length) % images.length); }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNavigate((openIndex + 1) % images.length); }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      <div
        className="relative max-h-[85vh] max-w-4xl w-full aspect-[4/3]"
        onClick={(e) => e.stopPropagation()}
      >
        <OptimizedImage
          src={galleryImageUrl(current.publicId, 1200)}
          alt={current.caption || "Gallery image"}
          fill
          sizes="90vw"
          className={cn("object-contain")}
        />
      </div>

      {current.caption && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">{current.caption}</p>
      )}
    </div>
  );
}
