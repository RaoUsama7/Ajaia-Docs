import { describe, expect, it } from "vitest";
import { MAX_IMPORT_SIZE, titleSchema, validateImportFile } from "./validation";

describe("document validation", () => {
  it("normalizes an empty title and rejects titles over 120 characters", () => {
    expect(titleSchema.parse("   ")).toBe("Untitled document");
    expect(titleSchema.safeParse("x".repeat(121)).success).toBe(false);
  });

  it("accepts scoped imports and rejects unsupported or oversized files", () => {
    expect(validateImportFile({ name: "notes.md", size: 20, type: "text/markdown" }).ok).toBe(true);
    expect(validateImportFile({ name: "notes.docx", size: 20, type: "application/octet-stream" }).ok).toBe(false);
    expect(validateImportFile({ name: "notes.txt", size: MAX_IMPORT_SIZE + 1, type: "text/plain" }).ok).toBe(false);
  });
});
