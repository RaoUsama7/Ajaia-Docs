"use client";

import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { importDocumentAction } from "@/app/actions";
import { validateImportFile } from "@/lib/validation";

export function ImportButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();

  function selectFile(next: File | null) {
    if (!next) return;
    const result = validateImportFile(next);
    if (!result.ok) { toast.error(result.error); if (inputRef.current) inputRef.current.value = ""; return; }
    setFile(next);
  }

  function importFile() {
    if (!file) { toast.error("Choose a file to import."); return; }
    startTransition(async () => {
      const data = new FormData(); data.set("file", file);
      const result = await importDocumentAction(data);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(result.message);
      setOpen(false);
      router.push(`/documents/${result.documentId}`);
    });
  }

  return <>
    <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"><Upload size={16}/>Import file</button>
    {open ? <div role="dialog" aria-modal="true" aria-labelledby="import-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target && !pending) setOpen(false); }}><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><h2 id="import-title" className="text-lg font-semibold text-slate-950">Import a document</h2><p className="mt-2 text-sm text-slate-600">Supported files: .txt and .md, up to 1 MB.</p><label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center hover:border-indigo-400 hover:bg-indigo-50/30"><Upload size={22} className="mb-2 text-slate-400"/><span className="text-sm font-medium text-slate-700">{file ? file.name : "Choose a file"}</span><span className="mt-1 text-xs text-slate-500">Text or Markdown</span><input ref={inputRef} type="file" accept=".txt,.md,text/plain,text/markdown" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0] ?? null)}/></label><div className="mt-6 flex justify-end gap-2"><button disabled={pending} onClick={() => setOpen(false)} className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700">Cancel</button><button disabled={pending || !file} onClick={importFile} className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">{pending ? "Importing…" : "Import file"}</button></div></div></div> : null}
  </>;
}
