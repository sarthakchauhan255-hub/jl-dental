import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { MediaAsset } from "@/types";

export interface IService extends Document {
  isFeatured: boolean;
  clinicId:    mongoose.Types.ObjectId | null;
  name:        string;
  slug:        string;
  icon:        string;
  shortDesc:   string;
  fullContent: string; // Rich text JSON string
  coverImage:  MediaAsset | null;
  order:       number;
  isActive:    boolean;
  seo:         { title?: string; description?: string };
  createdAt:   Date;
  updatedAt:   Date;
}

const MediaAssetSchema = new Schema<MediaAsset>(
  { url: String, publicId: String, alt: String, width: Number, height: Number },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    clinicId:    { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    name:        { type: String, required: true, trim: true, maxlength: 100 },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon:        { type: String, default: "" },
    shortDesc:   { type: String, required: true, maxlength: 300 },
    fullContent: { type: String, default: "" },
    coverImage:  { type: MediaAssetSchema, default: null },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    seo: {
      title:       { type: String, maxlength: 70  },
      description: { type: String, maxlength: 160 },
    },
  },
  { timestamps: true }
);

ServiceSchema.index({ clinicId: 1, isActive: 1, order: 1 });

export const Service: Model<IService> =
  mongoose.models.Service ?? mongoose.model<IService>("Service", ServiceSchema);
