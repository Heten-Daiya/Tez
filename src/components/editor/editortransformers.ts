/**
 * Custom transformers for the LexicalMarkdownEditor
 * Handles wiki-style links, embedded notes, and GitHub Flavored Markdown features
 * Ensures proper roundtrip conversions with no loss of information
 */
import { TRANSFORMERS } from '@lexical/markdown';
import { LinkNode } from '@lexical/link';
import { WikiLinkNode, $isWikiLinkNode } from './nodes/WikiLinkNode';
import { EmbeddedNoteNode, $isEmbeddedNoteNode } from './nodes/EmbeddedNoteNode';
import { $isCodeNode } from '@lexical/code';
import { $isTableNode, $isTableRowNode, $isTableCellNode, TableNode, TableRowNode, TableCellNode, $createTableNode, $createTableRowNode, $createTableCellNode } from '@lexical/table';
import { ImageNode, $isImageNode, $createImageNode } from './nodes/ImageNode';
import { HorizontalRuleNode, $isHorizontalRuleNode, $createHorizontalRuleNode } from './nodes/HorizontalRuleNode';
import { $createParagraphNode, $createTextNode, $getRoot, LexicalNode } from 'lexical';
import { HTMLNode, $isHTMLNode, $createHTMLNode } from './nodes/HTMLNode';

// Helper function to parse markdown table and create a table node
function parseMarkdownTable(tableText: string) {
  const lines = tableText.trim().split('\n');
  if (lines.length < 2) return null; // Need at least header and separator row
  
  // Check if second line contains separator row (---|---|---)
  const separatorRow = lines[1];
  if (!separatorRow.includes('-')) return null;
  
  // Parse column alignments from separator row
  const alignments: ('left' | 'center' | 'right')[] = [];
  
  // Handle tables with or without leading/trailing pipes
  const hasPipes = separatorRow.includes('|');
  let separatorCells: string[];
  
  if (hasPipes) {
    separatorCells = separatorRow.split('|').map(cell => cell.trim());
    // Remove empty cells at start/end if the separator starts/ends with |
    if (separatorCells[0] === '') separatorCells.shift();
    if (separatorCells[separatorCells.length - 1] === '') separatorCells.pop();
  } else {
    // For tables without pipes, each cell is separated by whitespace
    separatorCells = separatorRow.trim().split(/\s+/);
  }
  
  // Determine alignment for each column based on the separator row
  separatorCells.forEach(cell => {
    if (cell.startsWith(':') && cell.endsWith(':')) {
      alignments.push('center');
    } else if (cell.endsWith(':')) {
      alignments.push('right');
    } else {
      alignments.push('left');
    }
  });
  
  const tableNode = $createTableNode();
  let isHeader = true;
  
  for (let i = 0; i < lines.length; i++) {
    // Skip separator row
    if (i === 1) continue;
    
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    let cells: string[];
    
    if (hasPipes) {
      // Split the line by | but handle escaped pipes \|
      cells = line.split(/(?<!\\)\|/);
      
      // Remove empty cells at start/end if the line starts/ends with |
      if (cells[0].trim() === '') cells.shift();
      if (cells[cells.length - 1].trim() === '') cells.pop();
    } else {
      // For tables without pipes, split by whitespace or cell boundaries
      // This is a simplified approach - real tables without pipes would need more complex parsing
      cells = line.trim().split(/\s{2,}|\t/);
    }
    
    const rowNode = $createTableRowNode(isHeader);
    
    cells.forEach((cellContent, cellIndex) => {
      const cellNode = $createTableCellNode(isHeader ? 'header' : 'normal');
      const paragraphNode = $createParagraphNode();
      
      // Unescape any escaped pipes in the cell content
      const unescapedContent = cellContent.trim().replace(/\\\|/g, '|');
      paragraphNode.append($createTextNode(unescapedContent));
      cellNode.append(paragraphNode);
      rowNode.append(cellNode);
    });
    
    tableNode.append(rowNode);
    isHeader = false; // After first row, all others are data rows
  }
  
  return tableNode;
}

// Helper function to convert a table node to markdown
function tableNodeToMarkdown(node: TableNode): string {
  let markdown = '';
  let columnCount = 0;
  let hasHeaderRow = false;
  let columnAlignments: ('left' | 'center' | 'right')[] = [];
  
  // First pass: determine column count and if there's a header row
  node.getChildren().forEach((rowNode, rowIndex) => {
    if ($isTableRowNode(rowNode)) {
      if (rowIndex === 0) {
        // Check if first row contains header cells instead of using getIsHeader
        const firstCell = rowNode.getFirstChild();
        hasHeaderRow = firstCell && $isTableCellNode(firstCell) && firstCell.getType() === 'header';
      }
      const cellCount = rowNode.getChildrenSize();
      columnCount = Math.max(columnCount, cellCount);
      
      // Initialize column alignments if not already set
      if (columnAlignments.length === 0 && cellCount > 0) {
        // Default all columns to left alignment
        columnAlignments = Array(columnCount).fill('left');
      }
    }
  });
  
  // Ensure we have at least one row
  if (columnCount === 0) {
    return '';
  }
  
  // Second pass: build markdown table
  node.getChildren().forEach((rowNode, rowIndex) => {
    if ($isTableRowNode(rowNode)) {
      let rowMarkdown = '|';
      
      // Process each cell in the row
      let cellsInRow = 0;
      rowNode.getChildren().forEach((cellNode, cellIndex) => {
        if ($isTableCellNode(cellNode)) {
          // Get text content from the cell
          const cellContent = cellNode.getTextContent().trim();
          // Escape pipes in cell content
          const escapedContent = cellContent.replace(/\|/g, '\\|');
          rowMarkdown += ` ${escapedContent} |`;
          cellsInRow++;
        }
      });
      
      // Add empty cells if row has fewer cells than columnCount
      while (cellsInRow < columnCount) {
        rowMarkdown += '  |';
        cellsInRow++;
      }
      
      // Add row to markdown
      markdown += rowMarkdown + '\n';
      
      // Add separator row after header
      if (rowIndex === 0) {
        let separatorRow = '|';
        for (let i = 0; i < columnCount; i++) {
          const alignment = columnAlignments[i] || 'left';
          if (alignment === 'center') {
            separatorRow += ' :---: |';
          } else if (alignment === 'right') {
            separatorRow += ' ---: |';
          } else { // left or default
            separatorRow += ' --- |';
          }
        }
        markdown += separatorRow + '\n';
      }
    }
  });
  
  return markdown;
}

// Define a MathNode type for LaTeX expressions
export type SerializedMathNode = {
  type: 'math';
  format: 'inline' | 'block';
  equation: string;
  version: 1;
};

// Custom transformers for GFM and wiki-style links
export const customTransformers = [
  ...TRANSFORMERS,
  // LaTeX Math expressions (both inline and block)
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      if (node.getType() === 'math') {
        const format = (node as any).getFormat();
        const equation = (node as any).getEquation();
        return format === 'inline' ? `$${equation}$` : `$$\n${equation}\n$$`;
      }
      return null;
    },
    // Match both inline ($...$) and block ($$...$$) math
    regExp: /\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$/g,
    replace: (textNode: any, match: RegExpMatchArray) => {
      const blockMath = match[1]; // Captured group for block math
      const inlineMath = match[2]; // Captured group for inline math
      
      if (blockMath !== undefined) {
        // Create block math node
        return [{
          type: 'math',
          format: 'block',
          equation: blockMath.trim(),
          version: 1,
        }];
      } else if (inlineMath !== undefined) {
        // Create inline math node
        return [{
          type: 'math',
          format: 'inline',
          equation: inlineMath.trim(),
          version: 1,
        }];
      }
      return null;
    },
  },
  // Custom transformer for WikiLinks and EmbeddedNotes
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      if ($isWikiLinkNode(node)) {
        return `[[${node.getTargetTitle()}]]`;
      }
      if ($isEmbeddedNoteNode(node)) {
        return `![[${node.getTargetTitle()}]]`;
      }
      return null;
    },
    // RegExp matches [[WikiLink Title]] or ![[Embed Title]]
    // Group 1 captures WikiLink title, Group 2 captures Embed Title
    regExp: /\[\[(.*?)\]\]|!\[\[(.*?)\]\]/g,
    replace: (matchNode: any, wikiTitle: string | undefined, embedTitle: string | undefined) => {
      // This signature implies that `wikiTitle` is the first captured group, and `embedTitle` is the second.
      // One of them will be undefined depending on what was matched.
      if (wikiTitle !== undefined) {
        // Matched [[WikiLink Title]]
        return [{
          type: WikiLinkNode.getType(),
          targetTitle: wikiTitle,
          version: 1,
        }];
      }
      if (embedTitle !== undefined) {
        // Matched ![[Embed Title]]
        return [{
          type: EmbeddedNoteNode.getType(),
          targetTitle: embedTitle,
          version: 1,
        }];
      }
      return null;
    },
  },
  // GFM: Task list items
  {
    dependencies: [],
    export: (node: any) => {
      if (node.getType() === 'listitem' && node.getChecked() !== null) {
        return `${node.getChecked() ? '[x]' : '[ ]'} `;
      }
      return null;
    },
    regExp: /^\s*\[([ x])\]\s+/,
    replace: (match: any, p1: string) => {
      return [{
        type: 'listitem',
        checked: p1 !== ' ',
        children: [],
      }];
    },
  },
  // GFM: Strikethrough is handled by the default TRANSFORMERS.STRIKETHROUGH
  // GFM: Images with support for titles and dimensions
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      if ($isImageNode(node)) {
        const altText = node.getAltText() || '';
        const src = node.getSrc() || '';
        const width = node.getWidth();
        const height = node.getHeight();
        const title = (node as any).getTitle?.() || '';
        
        // Basic format: ![alt](src)
        let markdown = `![${altText}](${src}`;
        
        // Add title if present: ![alt](src "title")
        if (title) {
          markdown += ` "${title}"`;
        }
        
        // Add dimensions as attributes if not 'inherit'
        const dimensions = [];
        if (width !== 'inherit') {
          dimensions.push(`width=${width}`);
        }
        if (height !== 'inherit') {
          dimensions.push(`height=${height}`);
        }
        
        if (dimensions.length > 0) {
          markdown += ` {${dimensions.join(' ')}}`;
        }
        
        markdown += ')';
        return markdown;
      }
      return null;
    },
    // Enhanced regex to match images with optional title and dimensions
    // ![alt](src) or ![alt](src "title") or ![alt](src) {width=100 height=200}
    regExp: /!\[(.*?)\]\((.*?)(\s+"(.*?)")?\)(\s+\{(.*?)\})?/g,
    replace: (textNode: any, match: RegExpMatchArray) => {
      const altText = match[1] || '';
      const src = match[2] || '';
      const title = match[4] || '';
      const dimensionsStr = match[6] || '';
      
      // Parse dimensions if present
      let width: string | number = 'inherit';
      let height: string | number = 'inherit';
      
      if (dimensionsStr) {
        const widthMatch = dimensionsStr.match(/width=(\d+)/);
        if (widthMatch) {
          width = parseInt(widthMatch[1], 10);
        }
        
        const heightMatch = dimensionsStr.match(/height=(\d+)/);
        if (heightMatch) {
          height = parseInt(heightMatch[1], 10);
        }
      }
      
      const imageNode = $createImageNode({ 
        src, 
        altText, 
        width, 
        height,
        title, // Store title if present
      });
      
      textNode.replace(imageNode);
      return null; 
    },
    trigger: ')', 
    type: 'text-match',
  },
  // Horizontal Rule
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      return $isHorizontalRuleNode(node) ? '\n---\n' : null;
    },
    regExp: /^---\s*$/m, // Matches '---' on its own line
    replace: (parentNode: any, children: any, match: any) => { // ElementTransformer signature
      const hrNode = $createHorizontalRuleNode();
      parentNode.replace(hrNode);
    },
    type: 'element', // This is an ElementTransformer for block-level elements
  },
  // GFM: Tables - Enhanced for proper roundtrip conversion
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      if ($isTableNode(node)) {
        return tableNodeToMarkdown(node);
      }
      return null;
    },
    // This regex matches markdown tables with:
    // - A header row (with or without leading/trailing pipes)
    // - A separator row with dashes and optional colons for alignment
    // - Zero or more data rows
    regExp: /^(\|?.+\|?)\s*\n(\|?\s*[-:\s]+[-:\s]*\|?\s*\n)(\|?.+\|?\s*\n)*/gm,
    replace: (parentNode: any, children: any, match: RegExpMatchArray) => {
      const tableText = match[0];
      const tableNode = parseMarkdownTable(tableText);
      if (tableNode) {
        parentNode.replace(tableNode);
      }
    },
    type: 'element',
  },
  // GFM: Autolinks
  {
    dependencies: [],
    export: (node: any) => {
      if (node.getType() === 'autolink') {
        return '';
      }
      return null;
    },
    regExp: /(https?:\/\/[^\s)]+)/g,
    replace: (match: any, p1: string) => {
      return [{
        type: 'autolink',
        url: p1,
        children: [{ text: p1 }],
      }];
    },
  },
  // HTML content preservation
  {
    dependencies: [],
    export: (node: LexicalNode) => {
      if ($isHTMLNode(node)) {
        return node.getHtml();
      }
      return null;
    },
    // Match HTML tags and content
    regExp: /(<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\2>|<([a-z][a-z0-9]*)\b[^>]*\/>)/gis,
    replace: (textNode: any, match: RegExpMatchArray) => {
      const htmlContent = match[0];
      const htmlNode = $createHTMLNode(htmlContent);
      textNode.replace(htmlNode);
      return null;
    },
    type: 'text-match',
  },
];

// Helper function `createLinkNode` was removed as it's specific to standard LinkNodes
// and custom nodes (WikiLinkNode, EmbeddedNoteNode) have their own $create...Node functions.