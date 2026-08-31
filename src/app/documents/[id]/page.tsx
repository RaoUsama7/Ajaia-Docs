import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { DocumentEditor } from "@/components/editor/document-editor";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDocumentForUser } from "@/lib/documents";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const result = await getDocumentForUser(id, user.id);
  if (result.status !== "ok") return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-6 text-center"><div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><LockKeyhole className="mx-auto text-slate-400"/><h1 className="mt-4 text-xl font-semibold text-slate-950">{result.status === "not-found" ? "Document not found" : "You don't have access"}</h1><p className="mt-2 text-sm leading-6 text-slate-600">{result.status === "not-found" ? "This document may have been deleted or the link is incorrect." : "Ask the document owner to share it with your demo user."}</p><Link href="/documents" className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white"><ArrowLeft size={16}/>Back to documents</Link></div></main>
  );
  const users = await db.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { createdAt: "asc" } });
  const { document } = result;
  const initialContent = typeof document.content === "object" && document.content && !Array.isArray(document.content) && document.content.type === "doc"
    ? document.content
    : { type: "doc", content: [{ type: "paragraph" }] };
  return <DocumentEditor
    documentId={document.id}
    initialTitle={document.title}
    initialContent={initialContent}
    owner={document.owner}
    currentUser={user}
    users={users}
    initialShares={document.shares.map((share) => ({ id: share.id, permission: share.permission, user: share.user }))}
    initialUpdatedAt={document.updatedAt.toISOString()}
    isOwner={document.ownerId === user.id}
  />;
}
