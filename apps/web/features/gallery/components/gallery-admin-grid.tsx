"use client";
import { useState }    from "react";
import { useRouter }   from "next/navigation";
import { Badge }       from "@/components/ui/badge";
import { Button }      from "@/components/ui/button";
import { ConfirmDialog } from "@/components/cms/confirm-dialog";
import { OptimizedImage } from "@/components/common/optimized-image";
import { Trash2 }      from "lucide-react";

interface GalleryItem { id: string; type: string; category: string; caption: string; isActive: boolean;
  image?: { url: string; publicId: string } | null;
  after?: { url: string; publicId: string } | null;
}

export function GalleryAdminGrid({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await fetch(`/api/gallery/${deleting.id}`, { method: "DELETE" });
    setLoading(false); setDeleting(null); router.refresh();
  }

  if (items.length === 0) {
    return <p className="py-16 text-center text-sm text-charcoal-400">No gallery items yet. Upload images to get started.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(item => {
          const imgUrl = (item.type === "before_after" ? item.after?.url : item.image?.url) ?? "";
          return (
            <div key={item.id} className="group relative rounded-xl border border-border bg-white overflow-hidden">
              <div className="relative aspect-[4/3] bg-charcoal-50">
                {imgUrl ? (
                  <OptimizedImage src={imgUrl} alt={item.caption || item.category} fill sizes="(max-width:640px) 50vw, 25vw" />
                ) : (
                  <div className="flex h-full items-center justify-center text-charcoal-300 text-xs">No image</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => setDeleting(item)} aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs text-charcoal-500 line-clamp-1">{item.caption || item.category}</p>
                <Badge variant={item.type === "before_after" ? "approved" : "pending"} className="mt-1 text-[10px]">
                  {item.type === "before_after" ? "Before/After" : "General"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={() => setDeleting(null)}
        title="Delete image?" description="This image will be permanently deleted."
        confirmLabel="Delete" destructive loading={loading} onConfirm={handleDelete} />
    </>
  );
}
