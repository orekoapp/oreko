'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Code,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showAttachment?: boolean;
  onAttachment?: () => void;
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        'p-1.5 rounded-md transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-0.5" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content...',
  className,
  showAttachment = false,
  onAttachment,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-md',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Bug #197: Skip onChange when syncing external value to prevent infinite loop
      if (!skipNextUpdate.current) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-sm [&_p]:text-sm [&_p]:leading-relaxed',
      },
    },
  });

  // Bug #197: Sync external value changes with skip flag to prevent infinite loop.
  // setContent triggers onUpdate → onChange → parent re-renders → value changes → repeat.
  // The skipRef prevents the onUpdate callback from firing onChange when we're syncing.
  const skipNextUpdate = useRef(false);
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      skipNextUpdate.current = true;
      editor.commands.setContent(value, false);
      // Reset flag after a tick to allow future user edits
      requestAnimationFrame(() => { skipNextUpdate.current = false; });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // HIGH #48: Block non-http(s) protocols to prevent javascript: XSS
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Only http:// and https:// URLs are allowed.');
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL', 'https://');
    if (url) {
      // HIGH #48: Block non-http(s) protocols to prevent javascript: XSS
      if (!/^https?:\/\//i.test(url)) {
        window.alert('Only http:// and https:// URLs are allowed.');
        return;
      }
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn('rounded-lg border bg-white dark:bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b flex-wrap">
        <ToolbarButton
          title="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Underline"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Link"
          active={editor.isActive('link')}
          onClick={setLink}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Align Left"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Center"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Align Right"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Justify"
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Bullet List"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Ordered List"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="Image"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          title="Code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Attachment Footer */}
      {showAttachment && (
        <div className="flex justify-end border-t px-3 py-2">
          <button
            type="button"
            onClick={onAttachment}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip className="h-4 w-4" />
            Attachment
          </button>
        </div>
      )}
    </div>
  );
}
