"use client";

import Link from "next/link";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteDocumentAction } from "@/app/actions";
import { formatRelativeTime } from "@/lib/utils";

type DocumentRow = {
  id: string;
  title: string;
  ownerId: string;
  updatedAt: Date;
  owner: { id: string; name: string; email: string };
};

export function DocumentList({ documents, type }: { documents: DocumentRow[]; currentUserId: string; type: "owned" | "shared" }) {
  const [menu, setMenu] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!documents.length) return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center">
      <p className="font-medium text-slate-700">{type === "owned" ? "You haven't created any documents yet." : "No documents have been shared with you yet."}</p>
      <p className="mt-1 text-sm text-slate-500">{type === "owned" ? "Create a document to start writing and sharing." : "Shared documents will appear here."}</p>
    </div>
  );

  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteDocumentAction(deleteId);
      if (result.success) { toast.success(result.message); setDeleteId(null); }
      else toast.error(result.error);
    });
  }

  return (
    <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1fr)_180px_160px_100px_36px] border-b border-slate-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-slate-400 md:grid"><span>Name</span><span>Owner</span><span>Updated</span><span>Access</span><span/></div>
      {documents.map((document, index) => (
        <div key={document.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_180px_160px_100px_36px] md:px-5 ${index ? "border-t border-slate-100" : ""}`}>
          <Link href={`/documents/${document.id}`} className="min-w-0"><p className="truncate font-medium text-slate-900 hover:text-indigo-700">{document.title}</p><p className="mt-1 text-xs text-slate-500 md:hidden">{type === "owned" ? "Owner" : `Shared by ${document.owner.name}`} · Updated {formatRelativeTime(document.updatedAt)}</p></Link>
          <span className="hidden truncate text-sm text-slate-600 md:block">{document.owner.name}</span>
          <span className="hidden text-sm text-slate-500 md:block">{formatRelativeTime(document.updatedAt)}</span>
          <span className="hidden text-sm font-medium text-slate-600 md:block">{type === "owned" ? "Owner" : "Editor"}</span>
          <div className="relative">
            {type === "owned" ? <button aria-label={`Actions for ${document.title}`} onClick={() => setMenu(menu === document.id ? null : document.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal size={18}/></button> : null}
            {menu === document.id ? <div className="absolute right-0 top-9 z-20 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"><button onClick={() => { setDeleteId(document.id); setMenu(null); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"><Trash2 size={15}/>Delete</button></div> : null}
          </div>
        </div>
      ))}
      {deleteId ? <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target) setDeleteId(null); }}><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><h2 id="delete-title" className="text-lg font-semibold text-slate-950">Delete document?</h2><p className="mt-2 text-sm leading-6 text-slate-600">This action cannot be undone. The document and its sharing access will be permanently removed.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setDeleteId(null)} className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700">Cancel</button><button disabled={pending} onClick={confirmDelete} className="h-9 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700">{pending ? "Deleting…" : "Delete document"}</button></div></div></div> : null}
    </div>
  );
}
