import { Note } from '../types';
import { findNoteLinks } from './noteUtils';

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  content?: string;
  x?: number;
  y?: number;
  z?: number;
  screenX?: number;
  screenY?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  bidirectional?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Helper function to recursively find links in Lexical JSON
const extractLinksFromLexicalNode = (node: any, links: Set<string>) => {
  if (!node) return;

  // Check for WikiLinkNode type, expecting targetId
  if (node.type === 'wikilink' && node.targetId) {
    links.add(node.targetId);
  }

  // Check for EmbeddedNoteNode type, expecting targetId
  if (node.type === 'embedded-note' && node.targetId) {
    links.add(node.targetId);
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      extractLinksFromLexicalNode(child, links);
    }
  }
};

// Parses Lexical JSON content to extract all unique link and embed targets
const parseLexicalContentForLinks = (content: string): string[] => {
  const links = new Set<string>();
  if (!content) return [];
  try {
    const lexicalState = JSON.parse(content);
    // The actual content is usually under a 'root' node
    if (lexicalState.root) {
      extractLinksFromLexicalNode(lexicalState.root, links);
    } else if (lexicalState.children) { // Fallback if root is not present but children are (less common for full state)
      extractLinksFromLexicalNode(lexicalState, links); 
    }
  } catch (error) {
    console.warn("Failed to parse Lexical content for links:", content, error);
    // Optionally, could add a fallback to regex for '[[...]]' if mixed content is possible, but risky.
  }
  return Array.from(links);
};

export const notesToGraphData = (notes: Note[] = [], previousData?: GraphData): GraphData => {
  // Preserve existing nodes that still exist in current notes
  const previousNodes = previousData?.nodes.filter(prevNode => 
    notes.some(note => note.id === prevNode.id)
  ) || [];

  // Create new nodes for notes without existing nodes
  const newNodes = notes.filter(note => 
    !previousNodes.some(prevNode => prevNode.id === note.id)
  ).map(note => ({
    id: note.id,
    name: note.title,
    content: note.content,
    val: 1 + (note.content.length / 500) + (note.tasks.length * 0.5),
    color: note.color.includes('dark:') 
      ? note.color.split('dark:')[0].trim()
      : note.color
  }));

  // Merge existing links with current relationships
  const currentIds = new Set(notes.map(n => n.id));
  const existingLinks = previousData?.links.filter(l => 
    currentIds.has(l.source) && currentIds.has(l.target)
  ) || [];

  // Update existing links' bidirectionality
  const updatedLinks = existingLinks.map(prevLink => {
    const sourceNote = notes.find(n => n.id === prevLink.source);
    const targetNote = notes.find(n => n.id === prevLink.target);
    
    if (!sourceNote || !targetNote) return prevLink; // Should not happen if currentIds check passed
    
    const isBidirectional = parseLexicalContentForLinks(targetNote.content)
      .some(linkId => linkId === sourceNote.id); // Compare IDs
    
    return {...prevLink, bidirectional: isBidirectional};
  });

  // Generate new links from current notes
  const newLinks: GraphLink[] = [];
  const linkMap = new Map<string, Set<string>>();

  notes.forEach(note => {
    parseLexicalContentForLinks(note.content).forEach(linkId => { // linkTitle is now linkId
      const targetNote = notes.find(n => n.id === linkId); // Find target note by ID
      if (targetNote && targetNote.id !== note.id) {
        const linkKey = `${note.id}-${targetNote.id}`;
        const reverseLinkKey = `${targetNote.id}-${note.id}`;
        
        if (!linkMap.has(linkKey) && !linkMap.has(reverseLinkKey)) {
          linkMap.set(linkKey, new Set([note.id, targetNote.id]));
          
          // Check for bidirectionality by seeing if the target note links back to the current note's ID
          const isBidirectional = parseLexicalContentForLinks(targetNote.content)
            .some(reverseLinkId => reverseLinkId === note.id);
          
          newLinks.push({
            source: note.id,
            target: targetNote.id,
            bidirectional: isBidirectional
          });
        }
      }
    });
  });

  const links = [...updatedLinks, ...newLinks];

  // Get IDs of deleted notes for cleanup
  const deletedNodeIds = getDeletedNodes(previousData?.nodes || [], notes);
  
  return {
    nodes: [...previousNodes, ...newNodes],
    links: links.filter(link => 
      !deletedNodeIds.has(link.source) && !deletedNodeIds.has(link.target)
    )
  };
};

const getDeletedNodes = (previousNodes: GraphNode[], currentNotes: Note[]): Set<string> => {
  const currentIds = new Set(currentNotes.map(n => n.id));
  return new Set(
    previousNodes
      .filter(node => !currentIds.has(node.id))
      .map(node => node.id)
  );
};