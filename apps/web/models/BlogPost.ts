/**
 * BlogPost model.
 * inlineImagePublicIds: tracks all Cloudinary assets embedded in rich text content.
 * On post deletion, all inline images are cleaned from Cloudinary.
 */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { BlogStatus } from "@/types";

export interface IBlogPost extends Document {
  clinicId:   mongoose.Types.ObjectId | null;
  title:      string;
  slug:       string;
  content:    string;   // Tiptap JSON as string
  coverImage: { url: string; publicId: string } | null;
  excerpt:    string;
  author:     string;
  tags:       string[];
  category:   string;
  status:     BlogStatus;
  publishedAt:Date | null;
  // Tracks Cloudinary assets in rich text for cleanup on delete
  inlineImagePublicIds: string[];
  seo: {
    title?:       string;
    description?: string;
    ogImage?:     { url: string; publicId: string } | null;
  };
  createdAt:  Date;
  updatedAt:  Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    clinicId:             { type: Schema.Types.ObjectId, ref: "Clinic", default: null },
    title:                { type: String, required: true, trim: true, maxlength: 200 },
    slug:                 { type: String, required: true, unique: true, lowercase: true },
    content:              { type: String, default: "" },
    coverImage:           {
      type: new Schema({ url: String, publicId: String }, { _id: false }),
      default: null,
    },
    excerpt:              { type: String, default: "", maxlength: 300 },
    author:               { type: String, default: "JL Dental" },
    tags:                 [{ type: String, maxlength: 50 }],
    category:             { type: String, default: "General" },
    status:               { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt:          { type: Date, default: null },
    inlineImagePublicIds: [{ type: String }],
    seo: {
      title:       { type: String },
      description: { type: String },
      ogImage: {
        type: new Schema({ url: String, publicId: String }, { _id: false }),
        default: null,
      },
    },
  },
  { timestamps: true }
);

BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ clinicId: 1, status: 1, publishedAt: -1 });
BlogPostSchema.index({ tags: 1 });
BlogPostSchema.index({ category: 1, status: 1 });

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ?? mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
