import React, { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode, LexicalEditor, SerializedEditorState } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { HeadingNode, QuoteNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import {
  $createTableNode,
  $createTableRowNode,
  $createTableCellNode,
  TableNode,
  TableRowNode,
  TableCellNode
} from '@lexical/table';
import { customTransformers } from './EditorTransformers';
import { $getNodeByKey } from 'lexical';
// import { $isTableNode, $isTableRowNode } from '@lexical/table';
import { ImageNode } from './nodes/ImageNode';
import { VideoNode } from './nodes/VideoNode';
import { AudioNode } from './nodes/AudioNode';

interface EditorObserverProps {
  value: string;
  onChange: (value: string) => void;
  setEditor: (editor: LexicalEditor) => void;
}

const EditorObserver: React.FC<EditorObserverProps> = ({ value, onChange, setEditor }) => {
  const [editor] = useLexicalComposerContext();
  
  // Set the editor reference for toolbar commands
  useEffect(() => {
    setEditor(editor);
    
    // Register custom commands for toolbar buttons
    editor.registerCommand('formatText', (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          selection.formatText(payload);
        }
      });
      return true;
    }, 0);

    editor.registerCommand('formatBlock', (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          if (payload === 'quote') {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }
      });
      return true;
    }, 0);

    editor.registerCommand('formatHeading', (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const { level } = payload as { level: number };
          $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
        }
      });
      return true;
    }, 0);
    
    // Register GFM commands
    editor.registerCommand('insertTable', (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          // Create a table with the specified dimensions
          const { rows, columns, withHeaderRow } = payload as { rows: number, columns: number, withHeaderRow: boolean };
          
          // All node creation must happen within the editor.update() callback
          const tableNode = $createTableNode();
          
          // Create header row if specified
          if (withHeaderRow) {
            const headerRow = $createTableRowNode(true);
            for (let i = 0; i < columns; i++) {
              const headerCell = $createTableCellNode('header');
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(`Header ${i + 1}`));
              headerCell.append(paragraph);
              headerRow.append(headerCell);
            }
            tableNode.append(headerRow);            
          }
          
          // Create data rows
          const rowsToCreate = withHeaderRow ? rows - 1 : rows;
          for (let i = 0; i < rowsToCreate; i++) {
            const row = $createTableRowNode();
            for (let j = 0; j < columns; j++) {
              const cell = $createTableCellNode();
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(`Cell ${i + 1}-${j + 1}`));
              cell.append(paragraph);
              row.append(cell);
            }
            
            tableNode.append(row);
          }
          
          selection.insertNodes([tableNode]);
        }
      });
      return true;
    }, 0);
    
    editor.registerCommand('insertUnorderedList', () => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const listNode = new ListNode('bullet');
          const listItemNode = new ListItemNode();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(selection.getTextContent() || 'List item'));
          listItemNode.append(paragraph);
          listNode.append(listItemNode);
          selection.insertNodes([listNode]);
        }
      });
      return true;
    }, 0);

    editor.registerCommand('insertOrderedList', () => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const listNode = new ListNode('number');
          const listItemNode = new ListItemNode();
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(selection.getTextContent() || 'List item'));
          listItemNode.append(paragraph);
          listNode.append(listItemNode);
          selection.insertNodes([listNode]);
        }
      });
      return true;
    }, 0);

    editor.registerCommand('insertCheckList', () => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const listNode = new ListNode('check');
          const listItemNode = new ListItemNode();
          listItemNode.setChecked(false);
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(selection.getTextContent() || 'Task item'));
          listItemNode.append(paragraph);
          listNode.append(listItemNode);
          selection.insertNodes([listNode]);
        }
      });
      return true;
    }, 0);

    // Register command for inserting media (Image, Video, Audio)
    editor.registerCommand('insertMedia', (payload) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const { src, type, fileName } = payload as { src: string, type: string, fileName: string };
          let nodeToInsert;
          if (type.startsWith('image')) {
            nodeToInsert = new ImageNode(src, fileName);
          } else if (type.startsWith('video')) {
            nodeToInsert = new VideoNode(src, fileName);
          } else if (type.startsWith('audio')) {
            nodeToInsert = new AudioNode(src, fileName);
          } else {
            console.warn('Unsupported media type:', type);
            return;
          }
          selection.insertNodes([nodeToInsert]);
        }
      });
      return true;
    }, 0);
    
    return () => {
      setEditor(null);
    };
  }, [editor, setEditor]);
  
  // Update editor content when external value changes
  useEffect(() => {
    if (!editor) return;
    
    try {
      // Parse the serialized editor state from the value prop
      const parsedState = value ? JSON.parse(value) : null;
      
      // Only update if we have valid state data and it's different from current
      if (parsedState && typeof parsedState === 'object') {
        const currentState = editor.getEditorState().toJSON();
        
        // Compare state objects to avoid unnecessary updates
        if (JSON.stringify(currentState) !== JSON.stringify(parsedState)) {
          const editorState = editor.parseEditorState(parsedState);
          // Wrap setEditorState in editor.update to avoid flushSync warning
          editor.update(() => {
            editor.setEditorState(editorState);
          });
        }
      } else if (!value) {
        // Handle empty state by creating a default paragraph
        editor.update(() => {
          $getRoot().clear();
          const paragraph = $createParagraphNode();
          $getRoot().append(paragraph);
        });
      }
    } catch (error) {
      console.error('Error parsing editor state:', error);
      // Fallback to creating a default paragraph if state can't be parsed
      editor.update(() => {
        $getRoot().clear();
        const paragraph = $createParagraphNode();
        $getRoot().append(paragraph);
      });
    }
  }, [editor, value]);
  
  // Listen for changes in the editor
  useEffect(() => {
    if (!editor) return;
    
    return editor.registerUpdateListener(({ editorState }) => {
      // Serialize the editor state to JSON
      const serializedState = JSON.stringify(editorState.toJSON());
      
      // Only trigger onChange if the serialized state is different from current value
      if (serializedState !== value) {
        onChange(serializedState);
      }
    });
  }, [editor, onChange, value]);
  
  return null;
};

export default EditorObserver;
