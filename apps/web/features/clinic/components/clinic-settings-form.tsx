"use client";
import { useState, useCallback } from "react";
import { SectionCard }     from "@/components/cms/section-card";
import { FormField }       from "@/components/cms/form-field";
import { UnsavedWarning }  from "@/components/cms/unsaved-warning";
import { SaveIndicator }   from "@/components/cms/save-indicator";
import { Input }           from "@/components/ui/input";
import { Textarea }        from "@/components/ui/textarea";
import { Button }          from "@/components/ui/button";
import type { IClinic }    from "@/models/Clinic";
import { BRAND } from "@/config/branding";
import { MediaUploadControl, type MediaFieldValue } from "@/components/cms/engine";

type PartialClinic = Partial<IClinic>;
type SaveState = "idle" | "saving" | "saved" | "error";

export function ClinicSettingsForm({ initialData }: { initialData: PartialClinic | null }) {
  const [form, setForm]       = useState<PartialClinic>(initialData ?? {});
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSave]  = useState<SaveState>("idle");
  const [errors, setErrors]   = useState<Record<string, string>>({});

  function update(patch: PartialClinic) {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  }

  const handleSave = useCallback(async () => {
    setSave("saving");
    setErrors({});
    try {
      const res  = await fetch("/api/clinic", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, tagline: (form as Record<string,unknown>).tagline,
          description: (form as Record<string,unknown>).description,
          contact: (form as Record<string,unknown>).contact,
          social:  (form as Record<string,unknown>).social,
          logo:    (form as Record<string,unknown>).logo ?? null,
        }),
      });
      const json = await res.json() as { success: boolean; error?: string; fields?: Record<string,string> };
      if (!json.success) {
        if (json.fields) setErrors(json.fields);
        setSave("error");
        return;
      }
      setIsDirty(false);
      setSave("saved");
      setTimeout(() => setSave("idle"), 3000);
    } catch {
      setSave("error");
    }
  }, [form]);

  return (
    <div className="space-y-6">
      <UnsavedWarning isDirty={isDirty} />

      {/* Branding — production logo (CMS-managed, Cloudinary-backed) */}
      <SectionCard
        title="Branding"
        description="The website logo. Rendered in the Navbar and public branding. Uploaded through the secure media pipeline."
      >
        <MediaUploadControl
          label="Clinic Logo"
          folder="clinic"
          withAlt
          aspectRatio="3/2"
          hint="PNG or WebP with transparency recommended. Shown at 40px height in the navbar."
          value={((form as Record<string, unknown>).logo as MediaFieldValue | null) ?? null}
          onChange={logo => update({ logo } as PartialClinic)}
          disabled={saveState === "saving"}
        />
      </SectionCard>

      {/* Basic info */}
      <SectionCard
        title="Basic Information"
        description="Clinic name and description displayed on the website."
        actions={<SaveIndicator state={saveState} />}
      >
        <div className="space-y-4">
          <FormField id="name" label="Clinic Name" required error={errors.name}>
            <Input
              id="name"
              value={(form.name as string) ?? ""}
              onChange={e => update({ name: e.target.value })}
              placeholder={BRAND.NAME}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </FormField>
          <FormField id="tagline" label="Tagline" hint="Appears below clinic name in the hero section.">
            <Input
              id="tagline"
              value={((form as Record<string,unknown>).tagline as string) ?? ""}
              onChange={e => update({ tagline: e.target.value } as PartialClinic)}
              placeholder="Premium dental care in Solan"
            />
          </FormField>
          <FormField id="description" label="Description" hint="Used for SEO and About sections.">
            <Textarea
              id="description"
              rows={4}
              value={((form as Record<string,unknown>).description as string) ?? ""}
              onChange={e => update({ description: e.target.value } as PartialClinic)}
              placeholder="About the clinic…"
            />
          </FormField>
        </div>
      </SectionCard>

      {/* Contact */}
      <SectionCard title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["phone","whatsapp","email","address","mapEmbedUrl","mapDirectionsUrl"] as const).map(field => {
            const CONTACT_LABELS: Record<string, string> = {
              phone: "Phone", whatsapp: "WhatsApp", email: "Email", address: "Address",
              mapEmbedUrl: "Map Embed URL", mapDirectionsUrl: "Map Directions URL",
            };
            const placeholder =
              field === "mapEmbedUrl"      ? "https://www.google.com/maps/embed?pb=… (paste only the src link)"
            : field === "mapDirectionsUrl" ? "https://maps.app.goo.gl/… (optional)"
            : undefined;
            return (
              <FormField
                key={field}
                id={`contact-${field}`}
                label={CONTACT_LABELS[field]}
                error={errors[`contact.${field}`]}
              >
                {field === "address" ? (
                  <Textarea
                    id={`contact-${field}`}
                    rows={2}
                    value={((form as Record<string,unknown>).contact as Record<string,string>)?.[field] ?? ""}
                    onChange={e => update({ contact: { ...((form as Record<string,unknown>).contact as object), [field]: e.target.value } } as PartialClinic)}
                  />
                ) : (
                  <Input
                    id={`contact-${field}`}
                    type={field === "email" ? "email" : "text"}
                    placeholder={placeholder}
                    value={((form as Record<string,unknown>).contact as Record<string,string>)?.[field] ?? ""}
                    onChange={e => update({ contact: { ...((form as Record<string,unknown>).contact as object), [field]: e.target.value } } as PartialClinic)}
                  />
                )}
              </FormField>
            );
          })}
        </div>
      </SectionCard>

      {/* Social */}
      <SectionCard title="Social Media">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(["instagram","facebook","googleBusiness","whatsapp"] as const).map(field => (
            <FormField key={field} id={`social-${field}`} label={field === "googleBusiness" ? "Google Business" : field.charAt(0).toUpperCase() + field.slice(1)}>
              <Input
                id={`social-${field}`}
                placeholder={`https://…`}
                value={((form as Record<string,unknown>).social as Record<string,string>)?.[field] ?? ""}
                onChange={e => update({ social: { ...((form as Record<string,unknown>).social as object), [field]: e.target.value } } as PartialClinic)}
              />
            </FormField>
          ))}
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex justify-end gap-3">
        {isDirty && (
          <Button variant="secondary" onClick={() => { setForm(initialData ?? {}); setIsDirty(false); }}>
            Discard changes
          </Button>
        )}
        <Button onClick={handleSave} disabled={saveState === "saving" || !isDirty}>
          {saveState === "saving" ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
