import { FileText, Plus } from "lucide-react";
import { createDocumentAction } from "@/app/actions";
import { DocumentList } from "@/components/document-list";
import { ImportButton } from "@/components/import-button";
import { getCurrentUser } from "@/lib/auth";
import { getAccessibleDocuments } from "@/lib/documents";

export const metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const { owned, shared } = await getAccessibleDocuments(user.id);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Documents</h1><p className="mt-2 text-slate-600">Create, edit and share documents with your team.</p></div>
        <div className="flex gap-2">
          <ImportButton />
          <form action={createDocumentAction}><button className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"><Plus size={17}/>New document</button></form>
        </div>
      </div>
      <div className="mt-10 space-y-10">
        <section><div className="mb-3 flex items-center gap-2"><FileText size={18} className="text-slate-500"/><h2 className="font-semibold text-slate-900">My Documents</h2><span className="text-sm text-slate-400">{owned.length}</span></div><DocumentList documents={owned} currentUserId={user.id} type="owned" /></section>
        <section><div className="mb-3 flex items-center gap-2"><FileText size={18} className="text-slate-500"/><h2 className="font-semibold text-slate-900">Shared With Me</h2><span className="text-sm text-slate-400">{shared.length}</span></div><DocumentList documents={shared} currentUserId={user.id} type="shared" /></section>
      </div>
    </main>
  );
}
