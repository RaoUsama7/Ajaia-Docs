import { db } from "@/lib/db";
import { canReadDocument } from "@/lib/permissions";

const documentInclude = {
  owner: { select: { id: true, name: true, email: true } },
  shares: { include: { user: { select: { id: true, name: true, email: true } } } },
} as const;

export async function getAccessibleDocuments(userId: string) {
  const documents = await db.document.findMany({
    where: { OR: [{ ownerId: userId }, { shares: { some: { userId } } }] },
    include: { owner: { select: { id: true, name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return {
    owned: documents.filter((document) => document.ownerId === userId),
    shared: documents.filter((document) => document.ownerId !== userId),
  };
}

export async function getDocumentForUser(documentId: string, userId: string) {
  const document = await db.document.findUnique({ where: { id: documentId }, include: documentInclude });
  if (!document) return { status: "not-found" as const };
  if (!canReadDocument(document, userId)) return { status: "forbidden" as const };
  return { status: "ok" as const, document };
}
