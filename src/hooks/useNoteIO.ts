/**
 * Custom hook for note import and export operations
 */
import { Note, Task } from '../types';
import { noteToMarkdown, generateNoteFilename, parseFrontmatter } from '../utils/noteUtils';
import { MARKDOWN_CONTENT_TYPE, FILE_EXTENSION_MD, DEFAULT_NOTE_TITLE, DEFAULT_NOTE_COLOR } from '../utils/constants';

/**
 * Check if File System Access API is supported
 */
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window;
};

/**
 * Hook that provides functions for importing and exporting notes
 * @param notes - Current notes array
 * @param setNotes - Function to update notes state
 * @returns Object containing import and export functions
 */
export const useNoteIO = (notes: Note[], setNotes: React.Dispatch<React.SetStateAction<Note[]>>) => {
  /**
   * Exports notes to markdown files using the File System Access API
   * Allows user to select a directory and saves each note as a separate file
   */
  const exportNotesToMarkdown = async () => {
    // Check if File System Access API is supported
    if (isFileSystemAccessSupported()) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        
        for (const note of notes) {
          const content = noteToMarkdown(note);
          const fileName = generateNoteFilename(note);
          
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(new Blob([content], { type: MARKDOWN_CONTENT_TYPE }));
          await writable.close();
        }
      } catch (err) {
        // Remove console.error
      }
    } else {
      // Use fallback method for unsupported browsers like Firefox
      exportNotesToFiles();
    }
  };

  /**
   * Exports notes as individual downloadable files
   * Used as a fallback for browsers that don't support the File System Access API
   */
  const exportNotesToFiles = () => {
    notes.forEach(note => {
      const content = noteToMarkdown(note);
      const fileName = generateNoteFilename(note);
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  /**
   * Parses a markdown file to extract note data
   * @param content - Markdown content to parse
   * @returns Note object or null if parsing fails
   */
  const parseMarkdownToNote = (content: string): Note | null => {
    const { frontmatter, content: noteContent } = parseFrontmatter(content);
    
    // Extract tasks section
    const tasksMatch = noteContent.match(/## Tasks\n([\s\S]*?)(?=\n##|$)/);
    const mainContent = noteContent.replace(/## Tasks\n[\s\S]*$/, '').trim();
    
    const tasks: Task[] = [];
    if (tasksMatch) {
      const taskLines = tasksMatch[1].match(/- \[(x| )\] .*/g) || [];
      for (const line of taskLines) {
        const completed = line.includes('[x]');
        const text = line.replace(/- \[(x| )\] /, '').trim();
        tasks.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          text,
          completed
        });
      }
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: frontmatter.title || DEFAULT_NOTE_TITLE,
      content: mainContent,
      color: frontmatter.color || DEFAULT_NOTE_COLOR,
      tasks,
      createdAt: frontmatter.created ? new Date(frontmatter.created) : new Date(),
      tags: frontmatter.tags || [],
      isMaximized: frontmatter.isMaximized || false
    };
  };

  /**
   * Imports notes from markdown files using the File System Access API
   * Allows user to select a directory and imports all markdown files
   */
  const importNotesFromMarkdown = async () => {
    // Check if File System Access API is supported
    if (isFileSystemAccessSupported()) {
      try {
        const dirHandle = await window.showDirectoryPicker();
        const newNotes: Note[] = [];

        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith(FILE_EXTENSION_MD)) {
            const file = await entry.getFile();
            const content = await file.text();
            
            const note = parseMarkdownToNote(content);
            if (note) newNotes.push(note);
          }
        }

        setNotes(prevNotes => [...prevNotes, ...newNotes]);
      } catch (err) {
        console.error(ERROR_MESSAGES.IMPORT_FAILED, err);
      }
    } else {
      // For unsupported browsers like Firefox, create a file input element
      // and trigger it programmatically
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.md';
      input.onchange = (e) => importNotesFromFiles((e.target as HTMLInputElement).files);
      input.click();
    }
  };

  /**
   * Imports notes from file input
   * Used as a fallback for browsers that don't support the File System Access API
   * @param files - FileList from input element
   */
  const importNotesFromFiles = async (files: FileList | null) => {
    if (!files) return;
    const newNotes: Note[] = [];

    for (const file of files) {
      if (file.name.endsWith('.md')) {
        const content = await file.text();
        const note = parseMarkdownToNote(content);
        if (note) newNotes.push(note);
      }
    }

    setNotes(prevNotes => [...prevNotes, ...newNotes]);
  };

  return {
    exportNotesToMarkdown,
    exportNotesToFiles,
    importNotesFromMarkdown,
    importNotesFromFiles
  };
};