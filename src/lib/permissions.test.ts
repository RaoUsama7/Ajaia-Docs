import { describe, expect, it } from "vitest";
import { canEditDocument, canReadDocument, isDocumentOwner } from "./permissions";

const document = { ownerId: "alex", shares: [{ userId: "jordan", permission: "EDITOR" as const }] };

describe("document permissions", () => {
  it("allows the owner to read, edit, and manage ownership-only actions", () => {
    expect(canReadDocument(document, "alex")).toBe(true);
    expect(canEditDocument(document, "alex")).toBe(true);
    expect(isDocumentOwner(document, "alex")).toBe(true);
  });

  it("allows a shared editor to read and edit without treating them as owner", () => {
    expect(canReadDocument(document, "jordan")).toBe(true);
    expect(canEditDocument(document, "jordan")).toBe(true);
    expect(isDocumentOwner(document, "jordan")).toBe(false);
  });

  it("denies an unshared user", () => {
    expect(canReadDocument(document, "taylor")).toBe(false);
    expect(canEditDocument(document, "taylor")).toBe(false);
  });
});
