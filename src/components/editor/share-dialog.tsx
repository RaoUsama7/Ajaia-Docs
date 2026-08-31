"use client";

import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { removeShareAction, shareDocumentAction } from "@/app/actions";
import { initials } from "@/lib/utils";

type User = { id: string; name: string; email: string };
type Share = { id: string; permission: "EDITOR"; user: User };

export function ShareDialog({ documentId, owner, users, shares, onClose }: { documentId: string; owner: User; users: User[]; shares: Share[]; onClose: () => void }) {
  const router = useRouter();
  const [target, setTarget] = useState("");
  const [pending, startTransition] = useTransition();
  const available = useMemo(() => users.filter((user) => user.id !== owner.id && !shares.some((share) => share.user.id === user.id)), [users, owner.id, shares]);
  function share() { if (!target) return; startTransition(async () => { const result = await shareDocumentAction(documentId, target); if (!result.success) toast.error(result.error); else { toast.success(result.message); setTarget(""); router.refresh(); } }); }
  function remove(userId: string) { startTransition(async () => { const result = await removeShareAction(documentId, userId); if (!result.success) toast.error(result.error); else { toast.success(result.message); router.refresh(); } }); }
  return <div role="dialog" aria-modal="true" aria-labelledby="sharing-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.currentTarget === event.target && !pending) onClose(); }}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 id="sharing-title" className="text-lg font-semibold text-slate-950">Document sharing</h2><p className="mt-1 text-sm text-slate-500">Anyone listed below can access this document.</p></div><button aria-label="Close sharing dialog" onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><h3 className="mt-6 text-sm font-semibold text-slate-800">People with access</h3><div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200"><AccessRow user={owner} label="Owner"/>{shares.map((share) => <div key={share.id} className="flex items-center gap-3 p-3"><Avatar name={share.user.name}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{share.user.name}</p><p className="truncate text-xs text-slate-500">{share.user.email}</p></div><span className="text-xs font-medium text-slate-500">Editor</span><button disabled={pending} onClick={() => remove(share.user.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button></div>)}</div><h3 className="mt-6 text-sm font-semibold text-slate-800">Add people</h3><div className="mt-2 flex gap-2"><select aria-label="Choose a demo user" value={target} onChange={(event) => setTarget(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Select a demo user…</option>{available.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select><button disabled={pending || !target} onClick={share} className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white"><UserPlus size={16}/>{pending ? "Sharing…" : "Share"}</button></div>{available.length === 0 ? <p className="mt-2 text-xs text-slate-500">All demo users already have access.</p> : null}</div></div>;
}

function Avatar({ name }: { name: string }) { return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">{initials(name)}</span>; }
function AccessRow({ user, label }: { user: User; label: string }) { return <div className="flex items-center gap-3 p-3"><Avatar name={user.name}/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div><span className="text-xs font-medium text-slate-500">{label}</span></div>; }
