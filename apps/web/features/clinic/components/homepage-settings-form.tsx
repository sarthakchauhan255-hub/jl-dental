"use client";
/**
 * HomepageSettingsForm — edits the Clinic document's `homepage` subtree.
 * Same controlled-form pattern as ClinicSettingsForm; saves via PATCH /api/clinic.
 */
import { useState } from "react";
import { SectionCard }  from "@/components/cms/section-card";
import { FormField }    from "@/components/cms/form-field";
import { Input }        from "@/components/ui/input";
import { Textarea }     from "@/components/ui/textarea";
import { Button }       from "@/components/ui/button";
import { Switch }       from "@/components/ui/switch";
import { MediaUploadControl, type MediaFieldValue } from "@/components/cms/engine";

interface Hero { headline: string; subheadline: string; ctaLabel: string; ctaHref: string; image: MediaFieldValue | null }
interface Preview { enabled: boolean; title: string; subtitle?: string; maxDisplay?: number }
interface Cta { enabled: boolean; headline: string; buttonLabel: string; buttonHref: string }

export interface HomepageValue {
  hero: Hero;
  servicesPreview: Preview;
  doctorsPreview:  Preview;
  testimonials:    Preview;
  ctaBlock:        Cta;
  faqPreview:      { enabled: boolean; title: string };
  galleryPreview:  Preview;
}

export function HomepageSettingsForm({ initial }: { initial: HomepageValue }) {
  const [form, setForm]   = useState<HomepageValue>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof HomepageValue>(key: K, value: Partial<HomepageValue[K]>) {
    setForm(f => ({ ...f, [key]: { ...f[key], ...value } }));
    setState("idle");
  }

  async function save() {
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/clinic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepage: form }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) { setError(json.error ?? "Save failed."); setState("error"); return; }
      setState("saved");
    } catch {
      setError("Network error — changes not saved.");
      setState("error");
    }
  }

  const previewRow = (
    key: "servicesPreview" | "doctorsPreview" | "testimonials" | "galleryPreview",
    label: string,
  ) => (
    <div className="flex flex-col gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-charcoal-800">{label}</span>
        <Switch checked={form[key].enabled} onCheckedChange={(v: boolean) => patch(key, { enabled: v })} aria-label={`Show ${label} on homepage`} />
      </div>
      {form[key].enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={form[key].title} maxLength={80} placeholder="Section title"
            onChange={e => patch(key, { title: e.target.value })} aria-label={`${label} title`} />
          <Input value={form[key].subtitle ?? ""} maxLength={160} placeholder="Subtitle (optional)"
            onChange={e => patch(key, { subtitle: e.target.value })} aria-label={`${label} subtitle`} />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Hero" description="The first thing visitors see. Keep the headline short and benefit-focused.">
        <div className="space-y-4">
          <FormField id="hero-headline" label="Headline" required>
            <Input id="hero-headline" value={form.hero.headline} maxLength={120}
              onChange={e => patch("hero", { headline: e.target.value })} />
          </FormField>
          <FormField id="hero-sub" label="Subheadline">
            <Textarea id="hero-sub" value={form.hero.subheadline} maxLength={240} rows={2}
              onChange={e => patch("hero", { subheadline: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="hero-cta-label" label="Button Label">
              <Input id="hero-cta-label" value={form.hero.ctaLabel} maxLength={40}
                onChange={e => patch("hero", { ctaLabel: e.target.value })} />
            </FormField>
            <FormField id="hero-cta-href" label="Button Link" hint="Internal path, e.g. /book">
              <Input id="hero-cta-href" value={form.hero.ctaHref} maxLength={200}
                onChange={e => patch("hero", { ctaHref: e.target.value })} />
            </FormField>
          </div>
          <MediaUploadControl
            label="Hero Image" folder="clinic" withAlt aspectRatio="16/9"
            hint="Optional. A warm clinic or smile photo works best. Recommended 1600×900+."
            value={form.hero.image}
            onChange={image => patch("hero", { image })}
            disabled={state === "saving"}
          />
        </div>
      </SectionCard>

      <SectionCard title="Homepage Sections" description="Toggle sections on or off and edit their headings.">
        <div className="space-y-4">
          {previewRow("servicesPreview", "Services Preview")}
          {previewRow("doctorsPreview",  "Doctors Preview")}
          {previewRow("galleryPreview",  "Gallery Preview")}
          {previewRow("testimonials",    "Testimonials")}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-sm font-medium text-charcoal-800">FAQ Preview</span>
            <Switch checked={form.faqPreview.enabled}
              onCheckedChange={(v: boolean) => patch("faqPreview", { enabled: v })} aria-label="Show FAQ preview on homepage" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Call-to-Action Banner" description="The banner near the bottom of the homepage.">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal-800">Show banner</span>
            <Switch checked={form.ctaBlock.enabled}
              onCheckedChange={(v: boolean) => patch("ctaBlock", { enabled: v })} aria-label="Show CTA banner" />
          </div>
          {form.ctaBlock.enabled && (
            <>
              <FormField id="cta-headline" label="Headline">
                <Input id="cta-headline" value={form.ctaBlock.headline} maxLength={120}
                  onChange={e => patch("ctaBlock", { headline: e.target.value })} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField id="cta-btn-label" label="Button Label">
                  <Input id="cta-btn-label" value={form.ctaBlock.buttonLabel} maxLength={40}
                    onChange={e => patch("ctaBlock", { buttonLabel: e.target.value })} />
                </FormField>
                <FormField id="cta-btn-href" label="Button Link">
                  <Input id="cta-btn-href" value={form.ctaBlock.buttonHref} maxLength={200}
                    onChange={e => patch("ctaBlock", { buttonHref: e.target.value })} />
                </FormField>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      <div className="flex items-center gap-4">
        <Button variant="primary" onClick={() => void save()} disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save Homepage"}
        </Button>
        {state === "saved" && <span className="text-sm text-green-600" role="status">Saved — the public homepage updates immediately.</span>}
        {error && <span className="text-sm text-destructive" role="alert">{error}</span>}
      </div>
    </div>
  );
}
