'use client';

import type { Editor } from '@tiptap/react';
import { useCallback } from 'react';

import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/shared/cn';

type Props = {
  editor: Editor;
  className?: string;
};

type ToolbarButtonProps = {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, pressed, disabled, onClick }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant={pressed ? 'secondary' : 'ghost'}
      size="sm"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="min-h-9 min-w-9 px-2 text-sm font-semibold"
    >
      {label}
    </Button>
  );
}

export function RichTextToolbar({ editor, className }: Props) {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL del enlace', previousUrl ?? 'https://');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div
      role="toolbar"
      aria-label="Formato de texto"
      className={cn(
        'flex flex-wrap gap-1 border-b border-brand-secondary/20 bg-brand-neutral/40 p-2',
        className,
      )}
    >
      <ToolbarButton
        label="Negrita"
        pressed={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="Cursiva"
        pressed={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="Subrayado"
        pressed={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <span className="mx-1 w-px self-stretch bg-brand-secondary/20" aria-hidden />
      <ToolbarButton
        label="Encabezado 2"
        pressed={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="Encabezado 3"
        pressed={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="Encabezado 4"
        pressed={editor.isActive('heading', { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      />
      <span className="mx-1 w-px self-stretch bg-brand-secondary/20" aria-hidden />
      <ToolbarButton
        label="Lista con viñetas"
        pressed={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Lista numerada"
        pressed={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Cita"
        pressed={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <span className="mx-1 w-px self-stretch bg-brand-secondary/20" aria-hidden />
      <ToolbarButton
        label="Enlace"
        pressed={editor.isActive('link')}
        onClick={setLink}
      />
    </div>
  );
}
