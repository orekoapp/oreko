'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Code,
  Variable,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ContractVariable } from '@/lib/contracts/types';

interface ContractEditorProps {
  content: string;
  onChange?: (content: string) => void;
  variables?: ContractVariable[];
  placeholder?: string;
  editable?: boolean;
}

export function ContractEditor({
  content,
  onChange,
  variables = [],
  placeholder = 'Start writing your contract template...',
  editable = true,
}: ContractEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-4 py-3 dark:prose-invert',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const insertVariable = (variable: ContractVariable) => {
    editor.chain().focus().insertContent(`{{${variable.key}}}`).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-muted' : ''}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          {variables.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm">
                    <Variable className="mr-2 h-4 w-4" />
                    Insert Variable
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {variables.map((variable) => (
                    <DropdownMenuItem
                      key={variable.key}
                      onClick={() => insertVariable(variable)}
                    >
                      <Code className="mr-2 h-4 w-4" />
                      <span className="font-mono text-sm">
                        {'{{'}{variable.key}{'}}'}
                      </span>
                      <span className="ml-2 text-muted-foreground">
                        - {variable.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
