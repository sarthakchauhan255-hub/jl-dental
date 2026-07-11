"use client";
import { useState, useCallback }  from "react";
import { useRouter }              from "next/navigation";
import { SectionCard }            from "@/components/cms/section-card";
import { FormField }              from "@/components/cms/form-field";
import { UnsavedWarning }         from "@/components/cms/unsaved-warning";
import { SaveIndicator }          from "@/components/cms/save-indicator";
import { Input }                  from "@/components/ui/input";
import { Textarea }               from "@/components/ui/textarea";
import { Button }                 from "@/components/ui/button";

interface DoctorFormValues {
  id?: string; name?: string; slug?: string; specialization?: string;
  qualifications?: string[]; bio?: string; order?: number; isActive?: boolean;
}
type SaveState = "idle" | "saving" | "saved" | "error";

export function DoctorForm({ initialData }: { initialData?: DoctorFormValues }) {
  const router  = useRouter();
  const isNew   = !initialData?.id;

  const [form, setForm]       = useState<DoctorFormValues>(initialData ?? {});
  const [isDirty, setIsDirty] = useState(false);
  const [save,  setSave]      = useState<SaveState>("idle");
  const [errors, setErrors]   = useState<Record<string,string>>({});

  function update(patch: Partial<DoctorFormValues>) {
    setForm(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  }

  const handleSave = useCallback(async () => {
    setSave("saving"); setErrors({});
    const method = isNew ? "POST" : "PATCH";
    const url    = isNew ? "/api/doctors" : `/api/doctors/${initialData?.id}`;
    try {
      const res  = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, slug: form.slug, specialization: form.specialization,
          bio: form.bio, order: form.order ?? 0, isActive: form.isActive ?? true,
          qualifications: form.qualifications ?? [],
        }),
      });
      const json = await res.json() as { success: boolean; error?: string; data?: DoctorFormValues; fields?: Record<string,string> };
      if (!json.success) {
        if (json.fields) setErrors(json.fields);
        setSave("error"); return;
      }
      setIsDirty(false);
      setSave("saved");
      if (isNew) router.push(`/admin/doctors/${json.data?.id}`);
      else setTimeout(() => setSave("idle"), 3000);
    } catch { setSave("error"); }
  }, [form, isNew, initialData]);

  return (
    <div className="space-y-6">
      <UnsavedWarning isDirty={isDirty} />

      <SectionCard title="Doctor Details" actions={<SaveIndicator state={save} />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="doc-name" label="Full Name" required error={errors.name}>
            <Input id="doc-name" value={form.name ?? ""} onChange={e => update({ name: e.target.value })} placeholder="Dr. Jane Smith" />
          </FormField>
          <FormField id="doc-slug" label="URL Slug" required error={errors.slug} hint="Used in the URL: /doctors/dr-jane-smith">
            <Input id="doc-slug" value={form.slug ?? ""} onChange={e => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-") })} placeholder="dr-jane-smith" />
          </FormField>
          <FormField id="doc-spec" label="Specialization" required error={errors.specialization} className="sm:col-span-2">
            <Input id="doc-spec" value={form.specialization ?? ""} onChange={e => update({ specialization: e.target.value })} placeholder="Cosmetic & Restorative Dentistry" />
          </FormField>
          <FormField id="doc-bio" label="Biography" className="sm:col-span-2">
            <Textarea id="doc-bio" rows={6} value={form.bio ?? ""} onChange={e => update({ bio: e.target.value })} placeholder="Doctor biography…" />
          </FormField>
          <FormField id="doc-order" label="Display Order" hint="Lower numbers appear first.">
            <Input id="doc-order" type="number" min={0} value={form.order ?? 0} onChange={e => update({ order: parseInt(e.target.value,10)||0 })} />
          </FormField>
        </div>
      </SectionCard>

      <div className="flex justify-between gap-3">
        <Button variant="secondary" onClick={() => router.push("/admin/doctors")}>← Back</Button>
        <div className="flex gap-2">
          {isDirty && !isNew && (
            <Button variant="secondary" onClick={() => { setForm(initialData ?? {}); setIsDirty(false); }}>Discard</Button>
          )}
          <Button onClick={handleSave} disabled={save === "saving" || (!isDirty && !isNew)}>
            {save === "saving" ? "Saving…" : isNew ? "Create Doctor" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
