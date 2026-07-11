import { ApiResourceService } from "@/lib/cms/contracts";
export interface FaqRecord extends Record<string, unknown> {
  id: string; question: string; answer: string;
  category: string; order: number; isActive: boolean;
  createdAt?: string; updatedAt?: string;
}
export interface FaqInput extends Record<string, unknown> {
  question: string; answer: string; category?: string; order?: number; isActive?: boolean;
}
export class FaqService extends ApiResourceService<FaqRecord, FaqInput> {
  constructor() { super("/api/faq"); }
}
export const faqService = new FaqService();
