/**
 * EditorLinkUtils component
 * Handles wiki-style links and embedded notes functionality for the LexicalMarkdownEditor
 */
import { $getSelection, $createTextNode, LexicalEditor, $insertNodes } from 'lexical';
import { $createWikiLinkNode } from './nodes/WikiLinkNode';
import { $createEmbeddedNoteNode } from './nodes/EmbeddedNoteNode';
import { Note } from '../../types'; // Assuming Note type is available
import { $createListNode, $createListItemNode } from '@lexical/list'; // Import list nodes

/**
 * Insert a wiki-style link(s) at the current selection or as a list.
 * If notesToLink is provided, it inserts links for those notes.
 * Otherwise, it uses the current selection's text content.
 */
export const insertWikiLink = (editor: LexicalEditor | null, notesToLink?: Note[]) => {
  if (!editor) return;
  
  editor.update(() => {
    const selection = $getSelection();
    if (!selection) return;

    if (notesToLink && notesToLink.length > 0) {
      if (notesToLink.length === 1) {
        const note = notesToLink[0];
        const linkNode = $createWikiLinkNode(note.id); // Pass note.id
        selection.insertNodes([linkNode]);
      } else {
        const listNode = $createListNode('bullet');
        notesToLink.forEach(note => {
          const listItemNode = $createListItemNode();
          const linkNode = $createWikiLinkNode(note.id); // Pass note.id
          listItemNode.append(linkNode);
          listNode.append(listItemNode);
        });
        selection.insertNodes([listNode]);
      }
    } else {
      // Existing behavior: use selected text as a placeholder for the ID
      // In a real scenario, you'd want to resolve this text to an actual note ID
      const text = selection.getTextContent() || 'Link ID';
      const linkNode = $createWikiLinkNode(text); // Pass text as ID placeholder
      selection.insertNodes([linkNode]);
    }
  });
};

/**
 * Insert an embedded note(s) at the current selection or as a list.
 * If notesToEmbed is provided, it inserts embeds for those notes.
 * Otherwise, it uses the current selection's text content.
 */
export const insertEmbeddedNote = (editor: LexicalEditor | null, notesToEmbed?: Note[]) => {
  if (!editor) return;
  
  editor.update(() => {
    const selection = $getSelection();
    if (!selection) return;

    if (notesToEmbed && notesToEmbed.length > 0) {
      // For multiple embeds, insert them directly without a list item decorator
      notesToEmbed.forEach(note => {
        const embedNode = $createEmbeddedNoteNode(note.id); // Pass note.id
        selection.insertNodes([embedNode]);
      });
    } else {
      // Existing behavior: use selected text as a placeholder for the ID
      // In a real scenario, you'd want to resolve this text to an actual note ID
      const text = selection.getTextContent() || 'Note ID';
      const embedNode = $createEmbeddedNoteNode(text); // Pass text as ID placeholder
      selection.insertNodes([embedNode]);
    }
  });
};
