import { ApiResourceService } from "@/lib/cms/contracts";
import type { CmsMutationResult } from "@/lib/cms/types";
export type ReviewStatus = "pending" | "approved" | "rejected";
export interface ReviewRecord extends Record<string, unknown> {
  id: string; patientName: string; rating: number; comment: string;
  status: ReviewStatus; source: string;
  createdAt?: string; updatedAt?: string;
}
export interface ReviewInput extends Record<string, unknown> {
  status?: ReviewStatus;
}
export class ReviewService extends ApiResourceService<ReviewRecord, ReviewInput> {
  constructor() { super("/api/reviews"); }
  approve(id: string): Promise<CmsMutationResult<ReviewRecord>> {
    return this.update(id, { status: "approved" });
  }
  reject(id: string): Promise<CmsMutationResult<ReviewRecord>> {
    return this.update(id, { status: "rejected" });
  }
}
export const reviewService = new ReviewService();
