export type DocumentAccess = {
  ownerId: string;
  shares: Array<{ userId: string; permission: "EDITOR" }>;
};

export function isDocumentOwner(document: DocumentAccess, userId: string) {
  return document.ownerId === userId;
}

export function canReadDocument(document: DocumentAccess, userId: string) {
  return isDocumentOwner(document, userId) || document.shares.some((share) => share.userId === userId);
}

export function canEditDocument(document: DocumentAccess, userId: string) {
  return isDocumentOwner(document, userId) || document.shares.some((share) => share.userId === userId && share.permission === "EDITOR");
}
