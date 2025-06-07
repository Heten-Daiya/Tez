/**
 * Utility functions for note operations
 */
import { Note, Task } from '../types';

/**
 * Generates a default title based on current date and time
 * @returns Formatted date/time string as title
 */
export const generateDefaultTitle = (): string => {
  const now = new Date();
  
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const month = now.toLocaleDateString('en-US', { month: 'short' });
  const day = now.getDate();
  const year = now.getFullYear();

  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
};

/**
 * Finds all wiki-style links in note content
 * @param content - The note content to search for links
 * @returns Array of link text found in the content
 */
export const findNoteLinks = (content: string): string[] => {
  const matches = content.match(/\[\[(.*?)\]\]/g) || [];
  return matches.map(match => match.slice(2, -2));
};

/**
 * Filters notes based on a search query
 * @param notes - Array of notes to filter
 * @param query - Search query string
 * @returns Filtered array of notes
 */
export const filterNotes = (notes: Note[], query: string): Note[] => {
  const lowercaseQuery = query.toLowerCase();
  return notes.filter(note => (
    note.title.toLowerCase().includes(lowercaseQuery) ||
    note.content.toLowerCase().includes(lowercaseQuery) ||
    note.tasks.some(task => task.text.toLowerCase().includes(lowercaseQuery)) ||
    note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  ));
};

/**
 * Generates markdown frontmatter for a note
 * @param note - The note to generate frontmatter for
 * @returns Frontmatter string
 */
export const generateNoteFrontmatter = (note: Note): string => {
  return [
    '---',
    `title: ${note.title || 'Untitled'}`,
    `created: ${new Date(note.createdAt).toISOString()}`,
    `color: ${note.color}`,
    `tags: [${note.tags.map(tag => `"${tag}"`).join(', ')}]`,
    `isMaximized: ${note.isMaximized || false}`,
    '---',
    '',
  ].join('\n');
};

/**
 * Converts tasks to markdown format with all properties
 * @param tasks - Array of tasks to convert
 * @returns Markdown string of tasks
 */
export const tasksToMarkdown = (tasks: Task[]): string => {
  if (!tasks.length) return '';
  
  const tasksList = tasks.map(task => {
    const lines = [];
    
    // Basic task line with completion status
    lines.push(`- [${task.completed ? 'x' : ' '}] ${task.title || task.text || 'Untitled Task'}`);
    
    // Add task properties as indented metadata
    if (task.id) lines.push(`  - id: ${task.id}`);
    if (task.description) lines.push(`  - description: ${task.description}`);
    if (task.priority) lines.push(`  - priority: ${task.priority}`);
    if (task.status) lines.push(`  - status: ${task.status}`);
    if (task.progress !== undefined) lines.push(`  - progress: ${task.progress}`);
    if (task.startDate) lines.push(`  - startDate: ${task.startDate.toISOString()}`);
    if (task.endDate) lines.push(`  - endDate: ${task.endDate.toISOString()}`);
    if (task.fulfils?.length) lines.push(`  - fulfils: [${task.fulfils.map(id => `"${id}"`).join(', ')}]`);
    if (task.requires?.length) lines.push(`  - requires: [${task.requires.map(id => `"${id}"`).join(', ')}]`);
    if (task.notifications?.length) {
      lines.push(`  - notifications: ${JSON.stringify(task.notifications)}`);
    }
    if (task.text && task.text !== task.title) lines.push(`  - text: ${task.text}`);
    
    return lines.join('\n');
  }).join('\n');
  
  return '## Tasks\n' + tasksList;
};

/**
 * Generates complete markdown content for a note
 * @param note - The note to convert to markdown
 * @returns Complete markdown content
 */
export const noteToMarkdown = (note: Note): string => {
  return [
    generateNoteFrontmatter(note),
    note.content || '',
    '',
    tasksToMarkdown(note.tasks)
  ].join('\n');
};

/**
 * Generates a safe filename for a note
 * @param note - The note to generate filename for
 * @returns Safe filename string
 */
export const generateNoteFilename = (note: Note): string => {
  return `${(note.title || 'untitled').replace(/[\/\\?%*:|"<>]/g, '-')}-${note.id}.md`;
};

/**
 * Parses frontmatter from markdown content
 * @param content - The markdown content to parse
 * @returns Object containing frontmatter data and remaining content
 */
export const parseFrontmatter = (content: string): { frontmatter: any, content: string } => {
  const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return { frontmatter: {}, content };
  }

  const frontmatterStr = frontmatterMatch[1];
  const remainingContent = content.slice(frontmatterMatch[0].length).trim();

  const frontmatter: any = {};
  const lines = frontmatterStr.split('\n');
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key === 'tags') {
        frontmatter.tags = value.slice(1, -1).split(',')
          .map(tag => tag.trim().replace(/"/g, ''))
          .filter(Boolean);
      } else if (key === 'isMaximized') {
        frontmatter.isMaximized = value.toLowerCase() === 'true';
      } else {
        frontmatter[key] = value;
      }
    }
  }

  return { frontmatter, content: remainingContent };
};


export const generateSequentialTitle = (notes: Note[]): string => {
  const numbers = notes.map(note => {
    const match = note.title.match(/Note (\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(n => !isNaN(n));
  
  let nextNumber = 1;
  while (numbers.includes(nextNumber)) {
    nextNumber++;
  }
  return `Note ${nextNumber}`;
};