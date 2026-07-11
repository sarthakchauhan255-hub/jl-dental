import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { GalleryType } from "@/types/index";

export interface IGalleryItem extends Document {
  clinicId: mongoose.Types.ObjectId | null;
  type:     GalleryType;
  category: string;
  before:   { url: string; publicId: string } | null;
  after:    { url: string; publicId: string } | null;
  image:    { url: string; publicId: string } | null;
  caption:  string;
  order:    number;
  isActive: boolean;
  createdAt:Date;
}

const GallerySchema = new Schema<IGalleryItem>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    type:     { type: String, enum: ["before_after","general"], required: true },
    category: { type: String, default: "General" },
    before:   { type: new Schema({ url: String, publicId: String }, { _id: false }), default: null },
    after:    { type: new Schema({ url: String, publicId: String }, { _id: false }), default: null },
    image:    { type: new Schema({ url: String, publicId: String }, { _id: false }), default: null },
    caption:  { type: String, default: "" },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GallerySchema.index({ clinicId: 1, type: 1, isActive: 1, order: 1 });

export const Gallery: Model<IGalleryItem> =
  mongoose.models.Gallery ?? mongoose.model<IGalleryItem>("Gallery", GallerySchema);
