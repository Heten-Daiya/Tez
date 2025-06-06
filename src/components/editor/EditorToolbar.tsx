import React, { useState } from 'react';
import { Bold, Italic, Code, List, ListOrdered, Quote, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Link as LinkIcon, SquareSquare, Strikethrough, Table, CheckSquare, Underline, Superscript, Subscript, Code2, Image, Video, Music } from 'lucide-react';
import TableSizeModal from './TableSizeModal';
import { LexicalEditor } from 'lexical';

interface ToolbarButtonProps {
  icon: React.ComponentType;
  title: string;
  onClick: () => void;
  darkMode: boolean;
  isActive?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon: Icon, 
  title, 
  onClick, 
  darkMode,
  isActive = false
}) => (
  <button 
    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isActive ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
    onClick={onClick}
    title={title}
  >
    <Icon size={18} />
  </button>
);


interface EditorToolbarProps {
  editor: LexicalEditor | null;
  insertWikiLink: () => void;
  insertEmbeddedNote: () => void;
  darkMode?: boolean;
  isSourceMode: boolean; // Now a required prop
  onToggleSourceMode: () => void; // Now a required prop
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  insertWikiLink,
  insertEmbeddedNote,
  darkMode = false,
  isSourceMode, // Received as prop
  onToggleSourceMode // Received as prop
}) => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const handleMediaInsert = (type: 'image' | 'video' | 'audio') => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = `${type}/*`;
  
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file && editor) {
      const blobUrl = URL.createObjectURL(file);
      editor.dispatchCommand('insertMedia', {
        type,
        src: blobUrl,
        altText: file.name,
        file
      });
    }
  };
  
  input.click();
};
  // Unified command handler
  const dispatchCommand = (command: string, args?: any) => {
    if (editor) {
      if (command === 'update') {
        editor.update(() => {
          editor.dispatchCommand(args.command, args.parameters);
        });
      } else {
        editor.dispatchCommand(command, args);
      }
    }
  };
  const handleInsertTable = (rows: number, columns: number, withHeaderRow: boolean) => {
    dispatchCommand('insertTable', { rows, columns, withHeaderRow });
  };

  const buttonConfigurations = [
    // Text formatting
    { icon: Bold, title: 'Bold', command: 'formatText', args: 'bold' },
    { icon: Italic, title: 'Italic', command: 'formatText', args: 'italic' },
    { icon: Underline, title: 'Underline', command: 'formatText', args: 'underline' },
    { icon: Strikethrough, title: 'Strikethrough', command: 'update', args: { command: 'formatText', parameters: 'strikethrough' } },
    { icon: Superscript, title: 'Superscript', command: 'update', args: { command: 'formatText', parameters: 'superscript' } },
    { icon: Subscript, title: 'Subscript', command: 'update', args: { command: 'formatText', parameters: 'subscript' } },
    { icon: Code, title: 'Code', command: 'formatText', args: 'code' },
    { type: 'separator' },
    // Lists
    { icon: List, title: 'Bullet List', command: 'insertUnorderedList' },
    { icon: ListOrdered, title: 'Ordered List', command: 'insertOrderedList' },
    { icon: CheckSquare, title: 'Task List', command: 'insertCheckList' },
    { icon: Quote, title: 'Blockquote', command: 'formatBlock', args: 'quote' },
    { type: 'separator' },
    // Source mode
    { icon: Code2, 
      title: 'Source Mode', 
      onClick: onToggleSourceMode,
      isActive: isSourceMode
    },    // Headings
    ...Array.from({ length: 6 }, (_, i) => ({
      icon: [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][i],
      title: `Heading ${i + 1}`,
      command: 'update',
      args: { command: 'formatHeading', parameters: { level: i + 1 } }
    })),
    { type: 'separator' },
    // Tables
    { icon: Table, title: 'Insert Table', onClick: () => setIsTableModalOpen(true) },
    { type: 'separator' },
    // Links & Embeds
    { icon: LinkIcon, title: 'Insert Wiki Link', onClick: insertWikiLink },
    { icon: SquareSquare, title: 'Insert Embedded Note', onClick: insertEmbeddedNote },
    { type: 'separator' },
    // Media
    { icon: Image, title: 'Insert Image', onClick: () => handleMediaInsert('image') },
    { icon: Video, title: 'Insert Video', onClick: () => handleMediaInsert('video') },
    { icon: Music, title: 'Insert Audio', onClick: () => handleMediaInsert('audio') },
    { type: 'separator' }
  ];

  return (
    <>
    <div className="markdown-editor-toolbar flex gap-1 mb-2 p-1 border border-gray-200 dark:border-gray-700 rounded">
      {buttonConfigurations.map((config, index) => {
        if (config.type === 'separator') {
          return <span key={`sep-${index}`} className="mx-.25"></span>;
        }
        
        return (
          <ToolbarButton
            key={config.title}
            icon={config.icon}
            title={config.title}
            onClick={() => config.onClick ? config.onClick() : dispatchCommand(config.command, config.args)}
            darkMode={darkMode}
            isActive={config.isActive}
          />
        );
      })}
    </div>
    <TableSizeModal
      isOpen={isTableModalOpen}
      onClose={() => setIsTableModalOpen(false)}
      onConfirm={handleInsertTable}
    />
    </>
  );
};

export default EditorToolbar;
