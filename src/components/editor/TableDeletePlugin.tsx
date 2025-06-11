import { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getSelection, $isRangeSelection } from 'lexical';
import { $isTableNode } from '@lexical/table';
import { Trash2 } from 'lucide-react';
import { ButtonIcon } from '../ButtonIcon';
import Portal from '../Portal';

export function TableDeletePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ x: number; y: number } | null>(null);
  const [targetTableKey, setTargetTableKey] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Removed handleClickOutside useEffect to ensure button remains visible when table is selected.
  // The button's visibility is now solely controlled by the editor's update listener.

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let tableNode = null;
        let tableElement: HTMLElement | null = null;

        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          for (const node of nodes) {
            let currentNode = node;
            while (currentNode !== null) {
              if ($isTableNode(currentNode)) {
                tableNode = currentNode;
                break;
              }
              currentNode = currentNode.getParent();
            }
            if (tableNode) break;
          }
        }

        if (tableNode) {
          tableElement = editor.getElementByKey(tableNode.getKey());
        }

        if (tableNode && tableElement) {
          const rect = tableElement.getBoundingClientRect();
          // Position the button at the top-right corner of the table
          setButtonPosition({
            x: rect.right - 30, // Adjust for button size
            y: rect.top + window.scrollY + 5, // Adjust for scroll and padding
          });
          setTargetTableKey(tableNode.getKey());
          setShowButton(true);
        } else {
          setShowButton(false);
          setButtonPosition(null);
          setTargetTableKey(null);
        }
      });
    });
  }, [editor]);

  const handleDeleteTable = () => {
    if (targetTableKey) {
      editor.update(() => {
        const node = $getNodeByKey(targetTableKey);
        if ($isTableNode(node)) {
          node.remove();
        }
      });
      setShowButton(false);
      setButtonPosition(null);
      setTargetTableKey(null);
    }
  };

  if (!showButton || !buttonPosition) {
    return null;
  }

  return (
    <Portal>
      <div
        ref={buttonRef}
        className="absolute z-50"
        style={{
          left: buttonPosition.x,
          top: buttonPosition.y,
        }}
      >
        <ButtonIcon
          icon={Trash2}
          onClick={handleDeleteTable}
          ariaLabel="Delete table"
          className="bg-white/80 dark:bg-gray-800/80 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full p-1.5 shadow-md"
          iconClassName="h-4 w-4 text-gray-600 dark:text-gray-300"
        />
      </div>
    </Portal>
  );
}
