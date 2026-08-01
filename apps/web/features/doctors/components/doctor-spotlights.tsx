"use client";

import Link from "next/link";
import { UserRound, ArrowRight } from "lucide-react";
import { SlideIn } from "@/components/common/motion";
import { OptimizedImage } from "@/components/common/optimized-image";
import { doctorPhotoUrl } from "@/lib/media/cloudinary-url";
import type { DoctorContent } from "@/features/doctors/schemas/doctor.schema";

/**
 * Doctor spotlights (public) — alternating two-column blocks. Each doctor's photo
 * and text slide in from opposite directions: odd rows converge from the outer
 * edges, even rows emerge from the centre. CMS-driven; scales for 1–3 doctors.
 *
 * Note: distinct from the admin `DoctorsList` (doctors-list.tsx) management table.
 */
export function DoctorSpotlights({ doctors }: { doctors: DoctorContent[] }) {
  return (
    <div className="flex flex-col gap-20 overflow-x-hidden md:gap-28">
      {doctors.map((doctor, i) => {
        const photoLeft = i % 2 === 0;
        const distance  = photoLeft ? 90 : 46; // converge (from edges) vs diverge (from centre)

        const photo = (
          <div className="mx-auto w-full max-w-[360px]">
            {doctor.photo?.publicId ? (
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-lg">
                <OptimizedImage
                  src={doctorPhotoUrl(doctor.photo.publicId)}
                  alt={`Dr. ${doctor.name}, ${doctor.specialization}`}
                  fill
                  sizes="(max-width: 768px) 90vw, 360px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-3xl border border-border bg-primary-50">
                <UserRound className="h-16 w-16 text-primary-300" aria-hidden="true" />
              </div>
            )}
          </div>
        );

        const text = (
          <div>
            <h2 className="heading-3 mb-2 text-primary-900">Get to Know Dr. {doctor.name}</h2>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--accent-cyan))]">
              {doctor.specialization}
            </p>
            {doctor.qualifications.length > 0 && (
              <p className="mb-5 text-sm font-medium text-primary-700">
                {doctor.qualifications.join("  ·  ")}
              </p>
            )}
            {doctor.bio && <DoctorBio bio={doctor.bio} />}
            <Link
              href="/book"
              className="btn-base inline-flex items-center gap-2 bg-primary-900 px-6 py-3 text-white hover:bg-primary-800"
            >
              Book a visit with Dr. {doctor.name.split(" ")[0]}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        );

        return (
          <div
            key={doctor.id}
            className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
          >
            <SlideIn from="left" distance={distance} className={photoLeft ? "md:order-1" : "md:order-2"}>
              {photo}
            </SlideIn>
            <SlideIn from="right" distance={distance} className={photoLeft ? "md:order-2" : "md:order-1"}>
              {text}
            </SlideIn>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Renders a doctor's free-text bio. Paragraphs (separated by blank lines) become
 * prose. An "Areas of Expertise" line, if present, splits off the lines beneath it
 * into a styled two-column list. Falls back to plain paragraphs when absent.
 */
function DoctorBio({ bio }: { bio: string }) {
  const lines = bio.split("\n").map((l) => l.trim());
  const headingIdx = lines.findIndex((l) => /^areas of expertise:?$/i.test(l));

  const toParagraphs = (text: string) =>
    text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  const paragraphs =
    headingIdx === -1
      ? toParagraphs(bio)
      : toParagraphs(lines.slice(0, headingIdx).join("\n"));

  const expertise = headingIdx === -1 ? [] : lines.slice(headingIdx + 1).filter(Boolean);

  return (
    <div className="mb-7 max-w-prose">
      <div className="space-y-4">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="body-base whitespace-pre-line text-muted-foreground">
            {p}
          </p>
        ))}
      </div>

      {expertise.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-700">
            Areas of Expertise
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {expertise.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="h-1.5 w-1.5 flex-none rounded-full bg-[hsl(var(--accent-cyan))]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
