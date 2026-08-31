import { PrismaClient } from "@prisma/client";
import * as local from "@/lib/local-store";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl = process.env.DATABASE_URL ?? "";
export const useLocalStore = process.env.NODE_ENV !== "production" && (!databaseUrl || /HOST:5432|USER:PASSWORD|placeholder/i.test(databaseUrl));

function userShape(user: ReturnType<typeof local.localUsers>[number], select?: Record<string, boolean>) {
  if (!select) return user;
  return Object.fromEntries(Object.keys(select).filter((key) => select[key]).map((key) => [key, user[key as keyof typeof user]]));
}

function hydrateDocument(item: NonNullable<ReturnType<typeof local.localDocumentById>>, includeOwner: boolean, includeShares: boolean) {
  const users = local.localUsers();
  return {
    ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt),
    ...(includeOwner ? { owner: users.find((user) => user.id === item.ownerId) } : {}),
    ...(includeShares ? { shares: local.localShares(item.id).map((share) => ({ ...share, createdAt: new Date(share.createdAt), user: users.find((user) => user.id === share.userId) })) } : {}),
  };
}

function localDb() {
  const user = {
    findMany: async (args?: { select?: Record<string, boolean> }) => local.localUsers().map((item) => userShape(item, args?.select)),
    findUnique: async (args: { where: { id?: string; email?: string }; select?: Record<string, boolean> }) => { const item = args.where.id ? local.localUserById(args.where.id) : local.localUserByEmail(args.where.email ?? ""); return item ? userShape(item, args.select) : null; },
    upsert: async (args: { where: { email: string }; update: Record<string, unknown>; create: { name: string; email: string } }) => local.localUserByEmail(args.where.email),
  };
  const document = {
    findMany: async (args: { where?: { OR?: Array<{ ownerId?: string; shares?: { some: { userId: string } } }> } }) => {
      const conditions = args.where?.OR ?? []; const ownerId = conditions.find((item) => item.ownerId)?.ownerId; const sharedUserId = conditions.find((item) => item.shares)?.shares?.some.userId;
      return local.localAllDocuments().filter((item) => item.ownerId === ownerId || (sharedUserId ? local.localShares(item.id).some((share) => share.userId === sharedUserId) : false)).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map((item) => hydrateDocument(item, true, false));
    },
    findUnique: async (args: { where: { id: string }; include?: { owner?: unknown; shares?: unknown }; select?: Record<string, boolean> }) => {
      const item = local.localDocumentById(args.where.id); if (!item) return null;
      if (args.select) return Object.fromEntries(Object.keys(args.select).filter((key) => args.select?.[key]).map((key) => [key, item[key as keyof typeof item]]));
      return hydrateDocument(item, Boolean(args.include && "owner" in args.include), Boolean(args.include && "shares" in args.include));
    },
    create: async (args: { data: { ownerId: string; title: string; content: unknown } }) => local.localCreateDocument(args.data),
    update: async (args: { where: { id: string }; data: { title?: string; content?: unknown } }) => local.localUpdateDocument(args.where.id, args.data),
    delete: async (args: { where: { id: string } }) => local.localDeleteDocument(args.where.id),
  };
  const documentShare = {
    create: async (args: { data: { documentId: string; userId: string } }) => local.localCreateShare(args.data),
    deleteMany: async (args: { where: { documentId: string; userId: string } }) => ({ count: local.localDeleteShare(args.where.documentId, args.where.userId) ? 1 : 0 }),
  };
  return { user, document, documentShare };
}

export const db = (useLocalStore ? localDb() : (globalForPrisma.prisma ?? new PrismaClient())) as PrismaClient;
if (!useLocalStore && process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
