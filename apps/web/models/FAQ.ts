import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IFAQ extends Document {
  clinicId: mongoose.Types.ObjectId | null;
  question: string;
  answer:   string;
  category: string;
  order:    number;
  isActive: boolean;
  createdAt:Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    question: { type: String, required: true },
    answer:   { type: String, required: true },
    category: { type: String, default: "General" },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FAQSchema.index({ clinicId: 1, isActive: 1, order: 1 });

export const FAQ: Model<IFAQ> =
  mongoose.models.FAQ ?? mongoose.model<IFAQ>("FAQ", FAQSchema);
