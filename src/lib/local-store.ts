import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type LocalUser = { id: string; name: string; email: string; avatar: string | null; createdAt: string; updatedAt: string };
type LocalDocument = { id: string; title: string; content: unknown; ownerId: string; createdAt: string; updatedAt: string };
type LocalShare = { id: string; documentId: string; userId: string; permission: "EDITOR"; createdAt: string };
type LocalData = { users: LocalUser[]; documents: LocalDocument[]; shares: LocalShare[] };

const dataDir = path.join(process.cwd(), ".local");
const dataFile = path.join(dataDir, "ajaia-data.json");
const demoUsers = [
  { id: "demo-alex", name: "Alex Morgan", email: "alex@ajaia.demo" },
  { id: "demo-jordan", name: "Jordan Lee", email: "jordan@ajaia.demo" },
  { id: "demo-taylor", name: "Taylor Kim", email: "taylor@ajaia.demo" },
];

function initialData(): LocalData {
  const timestamp = new Date().toISOString();
  return { users: demoUsers.map((user) => ({ ...user, avatar: null, createdAt: timestamp, updatedAt: timestamp })), documents: [], shares: [] };
}

function writeData(data: LocalData) {
  fs.mkdirSync(dataDir, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(temporaryFile, dataFile);
}

function readData(): LocalData {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) { const data = initialData(); writeData(data); return data; }
  try { return JSON.parse(fs.readFileSync(dataFile, "utf8")) as LocalData; } catch { const data = initialData(); writeData(data); return data; }
}

const timestamp = () => new Date().toISOString();
const newId = () => crypto.randomUUID();

export function localUsers() { return readData().users; }
export function localUserById(userId: string) { return readData().users.find((user) => user.id === userId) ?? null; }
export function localUserByEmail(email: string) { return readData().users.find((user) => user.email === email) ?? null; }
export function localAllDocuments() { return readData().documents; }
export function localDocumentById(documentId: string) { return readData().documents.find((document) => document.id === documentId) ?? null; }
export function localShares(documentId?: string) { return readData().shares.filter((share) => !documentId || share.documentId === documentId); }

export function localCreateDocument(input: { ownerId: string; title: string; content: unknown }) {
  const data = readData(); const date = timestamp();
  const document: LocalDocument = { id: newId(), ownerId: input.ownerId, title: input.title, content: input.content, createdAt: date, updatedAt: date };
  data.documents.push(document); writeData(data); return document;
}

export function localUpdateDocument(documentId: string, input: { title?: string; content?: unknown }) {
  const data = readData(); const document = data.documents.find((item) => item.id === documentId); if (!document) return null;
  if (input.title !== undefined) document.title = input.title; if (input.content !== undefined) document.content = input.content; document.updatedAt = timestamp(); writeData(data); return document;
}

export function localDeleteDocument(documentId: string) {
  const data = readData(); const index = data.documents.findIndex((document) => document.id === documentId); if (index < 0) return null;
  const [deleted] = data.documents.splice(index, 1); data.shares = data.shares.filter((share) => share.documentId !== documentId); writeData(data); return deleted;
}

export function localCreateShare(input: { documentId: string; userId: string }) {
  const data = readData(); const share: LocalShare = { id: newId(), documentId: input.documentId, userId: input.userId, permission: "EDITOR", createdAt: timestamp() };
  data.shares.push(share); writeData(data); return share;
}

export function localDeleteShare(documentId: string, userId: string) {
  const data = readData(); const before = data.shares.length; data.shares = data.shares.filter((share) => !(share.documentId === documentId && share.userId === userId)); writeData(data); return before !== data.shares.length;
}
