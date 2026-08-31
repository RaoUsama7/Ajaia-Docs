"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Redo2, Underline as UnderlineIcon, Undo2 } from "lucide-react";

type Tool = { label: string; icon: React.ComponentType<{ size?: number }>; active?: () => boolean; disabled?: () => boolean; run: () => void };

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="h-12 border-b border-slate-200 bg-white"/>;
  const tools: Tool[] = [
    { label: "Undo", icon: Undo2, disabled: () => !editor.can().undo(), run: () => editor.chain().focus().undo().run() },
    { label: "Redo", icon: Redo2, disabled: () => !editor.can().redo(), run: () => editor.chain().focus().redo().run() },
    { label: "Bold", icon: Bold, active: () => editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: () => editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: UnderlineIcon, active: () => editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Heading 1", icon: Heading1, active: () => editor.isActive("heading", { level: 1 }), run: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", icon: Heading2, active: () => editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Heading 3", icon: Heading3, active: () => editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Bulleted list", icon: List, active: () => editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: () => editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
  ];
  return <div className="sticky top-16 z-20 overflow-x-auto border-b border-slate-200 bg-white"><div className="mx-auto flex min-w-max max-w-5xl items-center gap-1 px-4 py-2 sm:px-6">{tools.map(({ label, icon: Icon, active, disabled, run }, index) => <button key={label} aria-label={label} title={label} disabled={disabled?.()} onClick={run} className={`flex h-8 w-8 items-center justify-center rounded-md transition ${active?.() ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"} ${index === 2 || index === 5 ? "ml-2" : ""}`}><Icon size={17}/></button>)}</div></div>;
}
