import { useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNodeByKey, $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { $isTableCellNode, $isTableRowNode, TableCellNode, TableRowNode } from '@lexical/table';
import '../../styles/tableEdgeHotspots.css';

type MenuPosition = {
  x: number;
  y: number;
  type: 'row' | 'column';
  targetNodeKey: string | null;
};

export function TableEdgePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set up event listeners for table edge detection
  useEffect(() => {
    const handleTableEdgeClick = (event: MouseEvent) => {
      // Get the target element and check if we're within a table structure
      const target = event.target as HTMLElement;
      const tableCell = target.closest('.editor-table-cell, .editor-table-cell-header');
      const tableRow = target.closest('.editor-table-row');
      
      if (!tableCell && !tableRow) return;
      
      // Check if we're clicking on a table row edge (horizontal)
      if (tableRow) {
        // Check each cell's bottom edge for row insertion
        const cells = tableRow.querySelectorAll('.editor-table-cell, .editor-table-cell-header');
        
        for (const cell of cells) {
          const rect = cell.getBoundingClientRect();
          if (Math.abs(event.clientY - rect.bottom) < 6) {
            const rowNodeKey = tableRow.getAttribute('data-lexical-node-key');
            
            setMenuPosition({
              x: rect.left,
              y: rect.bottom,
              type: 'row',
              targetNodeKey: rowNodeKey
            });
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
      }
      
      // Check if we're clicking on a table cell edge (vertical)
      if (tableCell) {
        const rect = tableCell.getBoundingClientRect();
        // Check if click is near the right edge of the cell
        if (Math.abs(event.clientX - rect.right) < 6) {
          const cellNodeKey = tableCell.getAttribute('data-lexical-node-key');
          
          setMenuPosition({
            x: rect.right,
            y: event.clientY,
            type: 'column',
            targetNodeKey: cellNodeKey
          });
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      }
    };

    // Add event listener to the editor
    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('click', handleTableEdgeClick);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('click', handleTableEdgeClick);
      }
    };
  }, [editor]);

  // Handle inserting a row
  const handleInsertRow = (position: 'before' | 'after') => {
    editor.update(() => {
      if (menuPosition?.targetNodeKey && menuPosition.type === 'row') {
        const node = $getNodeByKey(menuPosition.targetNodeKey);
        if ($isTableRowNode(node)) {
          const tableRow = node as TableRowNode;
          const table = tableRow.getParent();
          const rowIndex = tableRow.getIndexWithinParent();
          
          // Create a new row with the same number of cells
          const newRow = new TableRowNode();
          const cellCount = tableRow.getChildrenSize();
          
          for (let i = 0; i < cellCount; i++) {
            const newCell = new TableCellNode('normal');
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(''));
            newCell.append(paragraph);
            newRow.append(newCell);
          }
          
          // Insert the new row before or after the current row
          if (position === 'before') {
            table.insertBefore(newRow, tableRow);
          } else {
            table.insertAfter(newRow, tableRow);
          }
        }
      }
    });
    
    setMenuPosition(null);
  };

  // Handle inserting a column
  const handleInsertColumn = (position: 'before' | 'after') => {
    editor.update(() => {
      if (menuPosition?.targetNodeKey && menuPosition.type === 'column') {
        const node = $getNodeByKey(menuPosition.targetNodeKey);
        if ($isTableCellNode(node)) {
          const tableCell = node as TableCellNode;
          const tableRow = tableCell.getParent();
          const table = tableRow?.getParent();
          const columnIndex = tableCell.getIndexWithinParent();
          
          if (table) {
            // For each row in the table, insert a new cell at the specified position
            const rows = table.getChildren();
            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              if ($isTableRowNode(row)) {
                const cells = row.getChildren();
                const isHeaderRow = row.getTag() === 'tr' && i === 0;
                
                // Create a new cell
                const newCell = new TableCellNode(isHeaderRow ? 'header' : 'normal');
                const paragraph = $createParagraphNode();
                paragraph.append($createTextNode(''));
                newCell.append(paragraph);
                
                // Insert the new cell at the correct position
                const targetCell = cells[columnIndex];
                if (position === 'before') {
                  row.insertBefore(newCell, targetCell);
                } else {
                  row.insertAfter(newCell, targetCell);
                }
              }
            }
          }
        }
      }
    });
    
    setMenuPosition(null);
  };

  // If no menu position, don't render anything
  if (!menuPosition) {
    return null;
  }

  // Render the context menu
  return (
    <div 
      ref={menuRef}
      className="table-edge-menu" 
      style={{
        left: menuPosition.type === 'column' ? menuPosition.x + 5 : menuPosition.x - 75,
        top: menuPosition.type === 'row' ? menuPosition.y + 5 : menuPosition.y - 30,
      }}
    >
      {menuPosition.type === 'row' ? (
        <>
          <div className="table-edge-menu-item" onClick={() => handleInsertRow('before')}>
            Insert row above
          </div>
          <div className="table-edge-menu-item" onClick={() => handleInsertRow('after')}>
            Insert row below
          </div>
        </>
      ) : (
        <>
          <div className="table-edge-menu-item" onClick={() => handleInsertColumn('before')}>
            Insert column left
          </div>
          <div className="table-edge-menu-item" onClick={() => handleInsertColumn('after')}>
            Insert column right
          </div>
        </>
      )}
    </div>
  );
}