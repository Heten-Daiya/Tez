/**
 * EditorLinkUtils component
 * Handles wiki-style links and embedded notes functionality for the LexicalMarkdownEditor
 */
import { $getSelection, $createTextNode, LexicalEditor } from 'lexical';
import { $createWikiLinkNode } from './nodes/WikiLinkNode';
import { $createEmbeddedNoteNode } from './nodes/EmbeddedNoteNode';

/**
 * Insert a wiki-style link at the current selection
 */
export const insertWikiLink = (editor: LexicalEditor | null) => {
  if (!editor) return;
  
  editor.update(() => {
    const selection = $getSelection();
    if (!selection) return;
    
    const text = selection.getTextContent() || 'Link Title';
    
    // Create a wiki link node
    const linkNode = $createWikiLinkNode(text);
    linkNode.setNoteTitle(text);
    
    // Replace selection with the link node
    selection.insertNodes([linkNode]);
  });
};

/**
 * Insert an embedded note link at the current selection
 */
export const insertEmbeddedNote = (editor: LexicalEditor | null) => {
  if (!editor) return;
  
  editor.update(() => {
    const selection = $getSelection();
    if (!selection) return;
    
    const text = selection.getTextContent() || 'Note Title';
    
    // Create an embedded note node
    const linkNode = $createEmbeddedNoteNode(text);
    linkNode.setNoteId(text);
    
    // Replace selection with the link node
    selection.insertNodes([linkNode]);
  });
};