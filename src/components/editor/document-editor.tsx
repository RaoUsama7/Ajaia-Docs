"use client";

import type { JSONContent } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveDocumentAction } from "@/app/actions";
import { formatRelativeTime } from "@/lib/utils";
import { EditorToolbar } from "./toolbar";
import { ShareDialog } from "./share-dialog";

type User = { id: string; name: string; email: string };
type Share = { id: string; permission: "EDITOR"; user: User };
type SaveState = "saved" | "saving" | "error";

export function DocumentEditor({ documentId, initialTitle, initialContent, owner, users, initialShares, initialUpdatedAt, isOwner }: { documentId: string; initialTitle: string; initialContent: JSONContent; owner: User; currentUser: User; users: User[]; initialShares: Share[]; initialUpdatedAt: string; isOwner: boolean }) {
  const [title, setTitle] = useState(initialTitle);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSaved, setLastSaved] = useState(initialUpdatedAt);
  const [shareOpen, setShareOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueRef = useRef(Promise.resolve());
  const versionRef = useRef(0);
  const latestRef = useRef<{ title?: string; content?: JSONContent }>({});

  const persist = useCallback((payload: { title?: string; content?: JSONContent }) => {
    const version = ++versionRef.current;
    setSaveState("saving");
    queueRef.current = queueRef.current.then(async () => {
      const result = await saveDocumentAction(documentId, payload);
      if (version !== versionRef.current) return;
      if (result.success) { setSaveState("saved"); setLastSaved(new Date().toISOString()); }
      else { setSaveState("error"); toast.error(result.error); }
    }).catch(() => { if (version === versionRef.current) { setSaveState("error"); toast.error("Couldn't save your changes. Please try again."); } });
  }, [documentId]);

  const scheduleSave = useCallback((payload: { title?: string; content?: JSONContent }) => {
    latestRef.current = { ...latestRef.current, ...payload };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { const latest = latestRef.current; latestRef.current = {}; persist(latest); }, 900);
  }, [persist]);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose prose-slate max-w-none", "aria-label": "Document content" } },
    onUpdate: ({ editor: currentEditor }) => scheduleSave({ content: currentEditor.getJSON() }),
  });

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (Object.keys(latestRef.current).length) persist(latestRef.current);
  }, [persist]);

  function updateTitle(value: string) { const next = value.slice(0, 120); setTitle(next); scheduleSave({ title: next }); }
  function finishTitle() { const normalized = title.trim() || "Untitled document"; setTitle(normalized); scheduleSave({ title: normalized }); }

  return <main className="min-h-[calc(100vh-4rem)] bg-slate-100">
    <div className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6"><Link href="/documents" aria-label="Back to documents" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><ArrowLeft size={19}/></Link><div className="min-w-0 flex-1">{isOwner ? <input aria-label="Document title" value={title} maxLength={120} onChange={(event) => updateTitle(event.target.value)} onBlur={finishTitle} className="w-full truncate border-0 bg-transparent p-0 text-lg font-semibold text-slate-950 outline-none"/> : <h1 className="truncate text-lg font-semibold text-slate-950">{title}</h1>}<p className="mt-0.5 text-xs text-slate-500">{isOwner ? "You own this document" : `Shared by ${owner.name}`} · {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : `Saved ${formatRelativeTime(lastSaved)}`}</p></div>{isOwner ? <button onClick={() => setShareOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Share2 size={16}/>Share</button> : null}</div></div>
    <EditorToolbar editor={editor}/>
    <div className="px-0 py-0 sm:px-6 sm:py-8"><div className="mx-auto min-h-[calc(100vh-220px)] max-w-4xl border-x border-slate-200 bg-white px-5 py-8 shadow-sm sm:rounded-sm sm:border sm:px-16 sm:py-14"><EditorContent editor={editor}/></div></div>
    {shareOpen ? <ShareDialog documentId={documentId} owner={owner} users={users} shares={initialShares} onClose={() => setShareOpen(false)}/> : null}
  </main>;
}
