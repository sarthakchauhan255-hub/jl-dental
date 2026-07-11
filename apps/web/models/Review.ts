import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { ReviewStatus } from "@/types/index";

export interface IReview extends Document {
  clinicId:    mongoose.Types.ObjectId | null;
  patientName: string;
  rating:      number;
  comment:     string;
  status:      ReviewStatus;
  source:      string;
  createdAt:   Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    clinicId:    { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    patientName: { type: String, required: true, trim: true },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    comment:     { type: String, required: true },
    status:      { type: String, enum: ["pending","approved","rejected"], default: "pending" },
    source:      { type: String, default: "website" },
  },
  { timestamps: true }
);

ReviewSchema.index({ clinicId: 1, status: 1, createdAt: -1 });

export const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>("Review", ReviewSchema);
