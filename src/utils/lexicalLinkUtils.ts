// f:\Notes\src\utils\lexicalLinkUtils.ts

/**
 * Represents a node in the Lexical editor state.
 */
interface LexicalNode {
  type: string;
  [key: string]: any; // Allows for other properties
}

/**
 * Represents a WikiLinkNode in the Lexical editor state.
 */
interface WikiLinkNode extends LexicalNode {
  type: 'wikilink';
  targetTitle: string;
}

/**
 * Represents an EmbeddedNoteNode in the Lexical editor state.
 */
interface EmbeddedNoteNode extends LexicalNode {
  type: 'embedded-note';
  targetTitle: string;
}

/**
 * Type guard to check if a node is a WikiLinkNode.
 * @param node - The Lexical node to check.
 * @returns True if the node is a WikiLinkNode, false otherwise.
 */
const isWikiLinkNode = (node: LexicalNode): node is WikiLinkNode => {
  return node.type === 'wikilink' && typeof (node as WikiLinkNode).targetTitle === 'string';
};

/**
 * Type guard to check if a node is an EmbeddedNoteNode.
 * @param node - The Lexical node to check.
 * @returns True if the node is an EmbeddedNoteNode, false otherwise.
 */
const isEmbeddedNoteNode = (node: LexicalNode): node is EmbeddedNoteNode => {
  return node.type === 'embedded-note' && typeof (node as EmbeddedNoteNode).targetTitle === 'string';
};

/**
 * Recursively traverses the Lexical node tree and updates target titles.
 * @param node - The current Lexical node.
 * @param oldTitle - The old title to search for.
 * @param newTitle - The new title to replace with.
 * @returns True if any updates were made, false otherwise.
 */
const updateTargetTitlesRecursive = (node: LexicalNode, oldTitle: string, newTitle: string): boolean => {
  let updated = false;

  if (isWikiLinkNode(node) || isEmbeddedNoteNode(node)) {
    if (node.targetTitle === oldTitle) {
      node.targetTitle = newTitle;
      updated = true;
    }
  }

  // Recursively process children if they exist
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (typeof child === 'object' && child !== null) {
        if (updateTargetTitlesRecursive(child as LexicalNode, oldTitle, newTitle)) {
          updated = true;
        }
      }
    }
  }
  
  // Process other potential nested structures like 'root.children' or specific node types with content
  // This part might need to be adapted based on the exact Lexical JSON structure
  if (node.root && node.root.children && Array.isArray(node.root.children)) {
     for (const child of node.root.children) {
      if (typeof child === 'object' && child !== null) {
        if (updateTargetTitlesRecursive(child as LexicalNode, oldTitle, newTitle)) {
          updated = true;
        }
      }
    }
  }

  return updated;
};

/**
 * Parses a Lexical JSON string and updates wiki links and embedded notes.
 * @param lexicalJsonString - The Lexical editor state as a JSON string.
 * @param oldTitle - The old note title to find and replace.
 * @param newTitle - The new note title to update to.
 * @returns The updated Lexical JSON string if changes were made, otherwise the original string.
 */
export const updateLexicalLinks = (lexicalJsonString: string, oldTitle: string, newTitle: string): string => {
  if (!lexicalJsonString) {
    return lexicalJsonString;
  }
  try {
    const lexicalState = JSON.parse(lexicalJsonString);

    // Assuming the main content is under `root`
    if (lexicalState.root && lexicalState.root.children && Array.isArray(lexicalState.root.children)) {
      let madeChanges = false;
      for (const childNode of lexicalState.root.children) {
        if (updateTargetTitlesRecursive(childNode, oldTitle, newTitle)) {
          madeChanges = true;
        }
      }
      if (madeChanges) {
        return JSON.stringify(lexicalState);
      }
    }
    return lexicalJsonString; // No changes or not a parsable structure we expect
  } catch (error) {
    console.error('Error parsing or updating Lexical JSON:', error);
    return lexicalJsonString; // Return original string on error
  }
};