import { EditorState } from 'lexical';

export function extractTextFromLexical(jsonString: string): string {
  try {
    const editorState = JSON.parse(jsonString) as EditorState;
    let text = '';

    function traverseNodes(nodes: any[]) {
      nodes.forEach((node: any) => {
        if (node.type === 'text' && node.text) {
          text += node.text + ' ';
        } else if (node.type === 'linebreak') {
          text += '\n';
        } else if (node.children && Array.isArray(node.children)) {
          // Recursively traverse children for complex nodes like paragraph, link, list, etc.
          traverseNodes(node.children);
        }
        // Add specific handling for other node types if needed, e.g., images, code blocks
        // For now, recursive traversal should cover most text-containing nodes.
      });
    }

    if (editorState && editorState.root && Array.isArray(editorState.root.children)) {
      traverseNodes(editorState.root.children);
    }

    return text.trim();
  } catch (e) {
    console.error('Failed to parse Lexical JSON:', e);
    // Return original string or empty string if parsing fails
    return jsonString || '';
  }
}