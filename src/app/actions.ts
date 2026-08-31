"use server";

import type { Prisma } from "@prisma/client";
import { generateJSON } from "@tiptap/html/server";
import StarterKit from "@tiptap/starter-kit";
import { marked, Renderer } from "marked";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, setCurrentUserCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditDocument, isDocumentOwner } from "@/lib/permissions";
import { filenameToTitle } from "@/lib/utils";
import { documentUpdateSchema, idSchema, titleSchema, validateImportFile } from "@/lib/validation";

export type ActionResult = { success: true; message?: string } | { success: false; error: string };
const EMPTY_DOCUMENT = { type: "doc", content: [{ type: "paragraph" }] };

function friendlyError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.includes("Demo users are missing")) return error.message;
  return fallback;
}

export async function switchUserAction(userId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(userId);
  if (!parsed.success) return { success: false, error: "Invalid user." };
  const user = await db.user.findUnique({ where: { id: parsed.data }, select: { id: true } });
  if (!user) return { success: false, error: "That demo user does not exist." };
  await setCurrentUserCookie(user.id);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function createDocumentAction() {
  const user = await getCurrentUser();
  const document = await db.document.create({ data: { title: "Untitled document", content: EMPTY_DOCUMENT, ownerId: user.id } });
  redirect(`/documents/${document.id}`);
}

export async function saveDocumentAction(documentId: string, input: unknown): Promise<ActionResult> {
  try {
    const [user, parsedId] = await Promise.all([getCurrentUser(), Promise.resolve(idSchema.safeParse(documentId))]);
    const parsed = documentUpdateSchema.safeParse(input);
    if (!parsedId.success || !parsed.success) return { success: false, error: "The document changes are invalid." };
    const document = await db.document.findUnique({ where: { id: parsedId.data }, include: { shares: true } });
    if (!document) return { success: false, error: "Document not found." };
    if (!canEditDocument(document, user.id)) return { success: false, error: "You do not have permission to edit this document." };
    if (parsed.data.title !== undefined && !isDocumentOwner(document, user.id)) {
      return { success: false, error: "Only the owner can rename this document." };
    }
    await db.document.update({
      where: { id: document.id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.content !== undefined ? { content: parsed.data.content as Prisma.InputJsonValue } : {}),
      },
    });
    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    return { success: false, error: friendlyError(error, "Couldn't save your changes. Please try again.") };
  }
}

export async function shareDocumentAction(documentId: string, targetUserId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!idSchema.safeParse(documentId).success || !idSchema.safeParse(targetUserId).success) return { success: false, error: "Invalid sharing request." };
    const [document, target] = await Promise.all([
      db.document.findUnique({ where: { id: documentId }, include: { shares: true } }),
      db.user.findUnique({ where: { id: targetUserId }, select: { id: true } }),
    ]);
    if (!document) return { success: false, error: "Document not found." };
    if (!isDocumentOwner(document, user.id)) return { success: false, error: "Only the owner can manage sharing." };
    if (!target) return { success: false, error: "That demo user does not exist." };
    if (target.id === document.ownerId) return { success: false, error: "The owner already has access." };
    if (document.shares.some((share) => share.userId === target.id)) return { success: false, error: "This person already has access." };
    await db.documentShare.create({ data: { documentId, userId: target.id, permission: "EDITOR" } });
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/documents");
    return { success: true, message: "Document shared." };
  } catch (error) {
    return { success: false, error: friendlyError(error, "Couldn't share the document. Please try again.") };
  }
}

export async function removeShareAction(documentId: string, targetUserId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const document = await db.document.findUnique({ where: { id: documentId }, select: { ownerId: true } });
    if (!document) return { success: false, error: "Document not found." };
    if (document.ownerId !== user.id) return { success: false, error: "Only the owner can manage sharing." };
    await db.documentShare.deleteMany({ where: { documentId, userId: targetUserId } });
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/documents");
    return { success: true, message: "Access removed." };
  } catch (error) {
    return { success: false, error: friendlyError(error, "Couldn't remove access. Please try again.") };
  }
}

export async function deleteDocumentAction(documentId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    const document = await db.document.findUnique({ where: { id: documentId }, select: { ownerId: true } });
    if (!document) return { success: false, error: "Document not found." };
    if (document.ownerId !== user.id) return { success: false, error: "Only the owner can delete this document." };
    await db.document.delete({ where: { id: documentId } });
    revalidatePath("/documents");
    return { success: true, message: "Document deleted." };
  } catch (error) {
    return { success: false, error: friendlyError(error, "Couldn't delete the document. Please try again.") };
  }
}

function textToDocument(text: string): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: text.split(/\r?\n/).map((line) => ({ type: "paragraph", content: line ? [{ type: "text", text: line }] : undefined })),
  };
}

async function markdownToDocument(text: string): Promise<Prisma.InputJsonValue> {
  const renderer = new Renderer();
  renderer.html = ({ text: raw }) => raw.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const html = await marked.parse(text, { renderer });
  return generateJSON(html, [StarterKit]) as Prisma.InputJsonValue;
}

export async function importDocumentAction(formData: FormData): Promise<ActionResult & { documentId?: string }> {
  try {
    const user = await getCurrentUser();
    const file = formData.get("file");
    if (!(file instanceof File)) return { success: false, error: "Choose a file to import." };
    const validation = validateImportFile(file);
    if (!validation.ok) return { success: false, error: validation.error };
    const text = await file.text();
    if (!text.trim()) return { success: false, error: "The selected file is empty." };
    const title = titleSchema.parse(filenameToTitle(file.name));
    const content = validation.extension === "md" ? await markdownToDocument(text) : textToDocument(text);
    const document = await db.document.create({ data: { ownerId: user.id, title, content } });
    revalidatePath("/documents");
    return { success: true, documentId: document.id, message: "File imported." };
  } catch (error) {
    return { success: false, error: friendlyError(error, "Couldn't import this file. Please try again.") };
  }
}
