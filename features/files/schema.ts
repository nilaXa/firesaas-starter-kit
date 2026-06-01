import { z } from "zod";

export const fileMetadataSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  ownerId: z.string(),
  name: z.string().min(1, "File name is required"),
  path: z.string().min(1, "Storage path is required"),
  contentType: z.string(),
  size: z.number().max(20 * 1024 * 1024, "File size cannot exceed 20MB"), // 20MB Limit
  status: z
    .enum(["uploaded", "processing", "ready", "failed"])
    .default("ready"),
});

export const registerFileInputSchema = fileMetadataSchema.omit({
  ownerId: true,
});

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;
export type RegisterFileInput = z.infer<typeof registerFileInputSchema>;
