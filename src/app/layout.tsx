import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Ajaia Docs", template: "%s · Ajaia Docs" },
  description: "Create, edit and share documents with your team.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let users: Array<{ id: string; name: string; email: string }> = [];
  let currentUser: { id: string; name: string; email: string } | null = null;
  try {
    [users, currentUser] = await Promise.all([
      db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true } }),
      getCurrentUser(),
    ]);
  } catch {
    // The setup screen below gives a useful failure mode before a database is configured.
  }

  return (
    <html lang="en">
      <body>
        {currentUser ? <AppHeader users={users} currentUser={currentUser} /> : null}
        {currentUser ? children : (
          <main className="mx-auto flex min-h-screen max-w-xl items-center px-6">
            <div className="w-full rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 font-semibold text-white">A</div>
              <h1 className="text-xl font-semibold text-slate-900">Ajaia Docs needs a database</h1>
              <p className="mt-2 leading-6 text-slate-600">Set <code className="rounded bg-slate-100 px-1.5 py-1 text-sm">DATABASE_URL</code>, run the migration and seed commands, then refresh.</p>
              <pre className="mt-5 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">npx prisma migrate deploy{"\n"}npm run db:seed{"\n"}npm run dev</pre>
            </div>
          </main>
        )}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
