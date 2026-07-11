import { ApiResourceService } from "@/lib/cms/contracts";
import type { CmsMutationResult } from "@/lib/cms/types";
export type AppointmentStatus =
  "pending"|"approved"|"rescheduled"|"rejected"|"cancelled"|"completed"|"no_show"|"expired";
export const APPOINTMENT_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  pending:     ["approved","rejected","cancelled"],
  approved:    ["completed","rescheduled","cancelled","no_show"],
  rescheduled: ["approved","rejected","cancelled"],
  rejected:[], cancelled:[], completed:[], no_show:[], expired:[],
};
export interface AppointmentRecord extends Record<string, unknown> {
  id: string; patientName: string; email: string; phone: string;
  service: string; preferredDate: string; preferredTime: string;
  status: AppointmentStatus; notes?: string;
  confirmedDate?: string|null; confirmedTime?: string|null;
  createdAt?: string; updatedAt?: string;
}
export interface AppointmentInput extends Record<string, unknown> {
  status?: AppointmentStatus;
  confirmedDate?: string|null; confirmedTime?: string|null; notes?: string;
}
export class AppointmentService extends ApiResourceService<AppointmentRecord, AppointmentInput> {
  constructor() { super("/api/appointments"); }
  approve(id: string, d?: string, t?: string): Promise<CmsMutationResult<AppointmentRecord>> {
    return this.update(id, { status: "approved", confirmedDate: d??null, confirmedTime: t??null });
  }
  complete(id: string): Promise<CmsMutationResult<AppointmentRecord>> {
    return this.update(id, { status: "completed" });
  }
  reject(id: string): Promise<CmsMutationResult<AppointmentRecord>> {
    return this.update(id, { status: "rejected" });
  }
  cancel(id: string): Promise<CmsMutationResult<AppointmentRecord>> {
    return this.update(id, { status: "cancelled" });
  }
}
export const appointmentService = new AppointmentService();
