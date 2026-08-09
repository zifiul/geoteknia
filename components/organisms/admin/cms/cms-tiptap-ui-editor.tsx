'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { Image } from '@tiptap/extension-image';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Selection } from '@tiptap/extensions';

import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { plainTextToHtml } from '@/lib/content/plaintext-to-html';
import { cn } from '@/lib/shared/cn';

import './cms-tiptap-ui-editor.scss';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const EMPTY_EDITOR_HTML = '<p></p>';

function normalizeOutgoingHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === EMPTY_EDITOR_HTML) {
    return '';
  }
  return html;
}

function normalizeIncomingHtml(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return EMPTY_EDITOR_HTML;
  }
  return plainTextToHtml(trimmed) || EMPTY_EDITOR_HTML;
}

function CmsMainToolbar({
  isMobile,
  onLinkClick,
}: {
  isMobile: boolean;
  onLinkClick: () => void;
}) {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[2, 3, 4]} />
        <ListDropdownMenu modal={false} types={['bulletList', 'orderedList']} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        <MarkButton type="code" />
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <Spacer />
    </>
  );
}

function CmsMobileLinkToolbar({ onBack }: { onBack: () => void }) {
  return (
    <>
      <ToolbarGroup>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon className="tiptap-button-icon" />
          <LinkIcon className="tiptap-button-icon" />
        </Button>
      </ToolbarGroup>
      <ToolbarSeparator />
      <LinkContent />
    </>
  );
}

export function CmsTiptapUiEditor({ label, value, onChange, error }: Props) {
  const labelId = useId();
  const skipExternalSync = useRef(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsBreakpoint('max', 768);
  const [mobileView, setMobileView] = useState<'main' | 'link'>('main');

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-labelledby': labelId,
        'data-testid': 'cms-body-editor',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        horizontalRule: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
      Underline,
      Image.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Selection,
    ],
    content: normalizeIncomingHtml(value),
    onUpdate: ({ editor: currentEditor }) => {
      skipExternalSync.current = true;
      onChange(normalizeOutgoingHtml(currentEditor.getHTML()));
    },
  });

  useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (skipExternalSync.current) {
      skipExternalSync.current = false;
      return;
    }
    const next = normalizeIncomingHtml(value);
    const current = editor.getHTML();
    if (current !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="cms-tiptap-ui-editor mt-3 block w-full max-w-full min-w-0 text-sm text-brand-secondary">
      <span id={labelId} className="font-medium">
        {label}
      </span>
      <div
        className={cn(
          'simple-editor-wrapper mt-1 w-full max-w-full min-w-0 rounded-md border bg-brand-surface',
          error ? 'border-brand-error' : 'border-brand-secondary/30',
        )}
      >
        <EditorContext.Provider value={{ editor }}>
          <Toolbar ref={toolbarRef}>
            {mobileView === 'main' ? (
              <CmsMainToolbar
                isMobile={isMobile}
                onLinkClick={() => setMobileView('link')}
              />
            ) : (
              <CmsMobileLinkToolbar onBack={() => setMobileView('main')} />
            )}
          </Toolbar>
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </EditorContext.Provider>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-sm text-brand-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
