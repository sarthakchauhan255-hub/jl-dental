/**
 * ResourceDetailPanel — sidebar information panel for CMS detail pages.
 *
 * Shows: timestamps, status, relationships, view links.
 * Server Component — no interaction needed.
 */
import Link from "next/link";
import { ExternalLink, Clock, User }   from "lucide-react";
import { SectionCard }                 from "@/components/cms/section-card";
import { ResourceStatusBadge }         from "./resource-status-badge";
import type { CmsRecord, CmsStatusDefinition } from "@/lib/cms/types";

interface DetailPanelField {
  label: string;
  value: React.ReactNode;
}

interface ResourceDetailPanelProps {
  record:       CmsRecord;
  statusField?: string;
  activeField?: string;
  createdBy?:   string;
  publicUrl?:   string;
  extraFields?: DetailPanelField[];
}

export function ResourceDetailPanel({
  record, statusField, activeField, createdBy, publicUrl, extraFields = [],
}: ResourceDetailPanelProps) {
  const statusVal = statusField ? String(record[statusField] ?? "") : undefined;
  const isActive   = activeField ? Boolean(record[activeField]) : undefined;

  const baseFields: DetailPanelField[] = [
    ...(statusVal ? [{ label: "Status", value: <ResourceStatusBadge label={statusVal} /> }] : []),
    ...(isActive !== undefined ? [{ label: "Visibility", value: <ResourceStatusBadge active={isActive} /> }] : []),
    ...(record.createdAt ? [{ label: "Created", value: formatDate(record.createdAt as string) }] : []),
    ...(record.updatedAt ? [{ label: "Last updated", value: formatDate(record.updatedAt as string) }] : []),
    ...(createdBy ? [{ label: "Author", value: <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{createdBy}</span> }] : []),
    ...extraFields,
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Details">
        <dl className="space-y-3">
          {baseFields.map(field => (
            <div key={field.label}>
              <dt className="text-xs text-charcoal-400 mb-0.5">{field.label}</dt>
              <dd className="text-sm text-charcoal-700">{field.value}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      {publicUrl && (
        <SectionCard title="Public Page">
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary-700 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on site
          </Link>
        </SectionCard>
      )}
    </div>
  );
}

function formatDate(dateStr: string | Date): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day:   "numeric",
      month: "short",
      year:  "numeric",
      hour:  "2-digit",
      minute:"2-digit",
    }).format(new Date(dateStr));
  } catch {
    return String(dateStr);
  }
}
