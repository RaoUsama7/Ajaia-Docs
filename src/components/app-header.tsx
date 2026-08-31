"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { switchUserAction } from "@/app/actions";
import { initials } from "@/lib/utils";

type User = { id: string; name: string; email: string };

export function AppHeader({ users, currentUser }: { users: User[]; currentUser: User }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(currentUser.id);

  function switchUser(userId: string) {
    setSelected(userId);
    startTransition(async () => {
      const result = await switchUserAction(userId);
      if (!result.success) {
        setSelected(currentUser.id);
        toast.error(result.error);
        return;
      }
      router.push("/documents");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/documents" className="flex items-center gap-2.5 font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm text-white">A</span>
          <span className="hidden sm:inline">Ajaia Docs</span>
        </Link>
        <nav className="flex-1"><Link href="/documents" className="text-sm font-medium text-slate-700 hover:text-slate-950">Documents</Link></nav>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-slate-400 md:inline">Demo User</span>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">{initials(users.find((user) => user.id === selected)?.name ?? currentUser.name)}</span>
            <select aria-label="Select demo user" disabled={pending} value={selected} onChange={(event) => switchUser(event.target.value)} className="h-10 max-w-48 appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-11 pr-8 text-sm font-medium text-slate-700 outline-none ring-indigo-500 focus:ring-2">
              {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 text-xs text-slate-400">▾</span>
          </div>
        </div>
      </div>
    </header>
  );
}
