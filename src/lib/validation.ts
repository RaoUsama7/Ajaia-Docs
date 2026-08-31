import { z } from "zod";

export const titleSchema = z.string().max(120).transform((value) => value.trim() || "Untitled document");

export const documentUpdateSchema = z.object({
  title: titleSchema.optional(),
  content: z.object({ type: z.literal("doc"), content: z.array(z.unknown()).optional() }).passthrough().optional(),
}).refine((value) => value.title !== undefined || value.content !== undefined, "Nothing to save");

export const idSchema = z.string().min(1).max(100);

export const MAX_IMPORT_SIZE = 1024 * 1024;
export const SUPPORTED_IMPORT_EXTENSIONS = ["txt", "md"] as const;

export function validateImportFile(file: Pick<File, "name" | "size" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !SUPPORTED_IMPORT_EXTENSIONS.includes(extension as "txt" | "md")) {
    return { ok: false as const, error: "Unsupported file type. Choose a .txt or .md file." };
  }
  if (file.size > MAX_IMPORT_SIZE) return { ok: false as const, error: "File is too large. The maximum size is 1 MB." };
  return { ok: true as const, extension: extension as "txt" | "md" };
}
