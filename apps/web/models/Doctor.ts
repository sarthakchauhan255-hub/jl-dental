import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { MediaAsset } from "@/types";

export interface IDoctor extends Document {
  clinicId:       mongoose.Types.ObjectId | null;
  name:           string;
  slug:           string;
  photo:          MediaAsset | null;
  specialization: string;
  qualifications: string[];
  bio:            string;
  order:          number;
  isActive:       boolean;
  seo:            { title?: string; description?: string };
  // Future-ready
  userId:         mongoose.Types.ObjectId | null; // When doctor gets login
  createdAt:      Date;
  updatedAt:      Date;
}

const MediaAssetSchema = new Schema<MediaAsset>(
  { url: String, publicId: String, alt: String, width: Number, height: Number },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
  {
    clinicId:       { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    name:           { type: String, required: true, trim: true, maxlength: 100 },
    slug:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    photo:          { type: MediaAssetSchema, default: null },
    specialization: { type: String, required: true, trim: true, maxlength: 100 },
    qualifications: [{ type: String, maxlength: 100 }],
    bio:            { type: String, default: "", maxlength: 3000 },
    order:          { type: Number, default: 0 },
    isActive:       { type: Boolean, default: true },
    seo: {
      title:       { type: String, maxlength: 70  },
      description: { type: String, maxlength: 160 },
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

DoctorSchema.index({ clinicId: 1, isActive: 1, order: 1 });

export const Doctor: Model<IDoctor> =
  mongoose.models.Doctor ?? mongoose.model<IDoctor>("Doctor", DoctorSchema);
