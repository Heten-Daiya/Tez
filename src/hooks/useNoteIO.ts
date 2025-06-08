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
      const taskContent = tasksMatch[1];
      const taskBlocks = taskContent.split(/\n(?=- \[)/); // Split on task lines
      
      for (const block of taskBlocks) {
        if (!block.trim()) continue;
        
        const lines = block.split('\n');
        const taskLine = lines[0];
        const metadataLines = lines.slice(1);
        
        // Parse main task line
        const taskMatch = taskLine.match(/- \[(x| )\] (.*)/);
        if (!taskMatch) continue;
        
        const completed = taskMatch[1] === 'x';
        const titleOrText = taskMatch[2].trim();
        
        // Initialize task with defaults
        const task: Task = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: titleOrText,
          description: '',
          completed,
          priority: 'medium' as TaskPriority,
          status: completed ? 'completed' as TaskStatus : 'not_started' as TaskStatus,
          progress: completed ? 100 : 0,
          fulfils: [],
          requires: [],
          notifications: [],
          text: titleOrText // For backward compatibility
        };
        
        // Parse metadata lines
        for (const line of metadataLines) {
          const metaMatch = line.match(/^\s*- (\w+): (.*)$/);
          if (!metaMatch) continue;
          
          const [, key, value] = metaMatch;
          
          switch (key) {
            case 'id':
              task.id = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'priority':
              task.priority = value as TaskPriority;
              break;
            case 'status':
              task.status = value as TaskStatus;
              break;
            case 'progress':
              task.progress = parseInt(value, 10) || 0;
              break;
            case 'startDate':
              task.startDate = new Date(value);
              break;
            case 'endDate':
              task.endDate = new Date(value);
              break;
            case 'fulfils':
              try {
                task.fulfils = JSON.parse(value.replace(/\[(.*)\]/, '[$1]'));
              } catch {
                task.fulfils = [];
              }
              break;
            case 'requires':
              try {
                task.requires = JSON.parse(value.replace(/\[(.*)\]/, '[$1]'));
              } catch {
                task.requires = [];
              }
              break;
            case 'notifications':
              try {
                task.notifications = JSON.parse(value);
              } catch {
                task.notifications = [];
              }
              break;
            case 'text':
              task.text = value;
              break;
          }
        }
        
        tasks.push(task);
      }
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: frontmatter.title || DEFAULT_NOTE_TITLE,
      content: mainContent,
      color: frontmatter.color || DEFAULT_NOTE_COLOR,
      backgroundImage: frontmatter.backgroundImage,
      tasks,
      createdAt: frontmatter.created ? new Date(frontmatter.created) : new Date(),
      tags: frontmatter.tags || [],
      position: frontmatter.position || 0,
      isMaximized: frontmatter.isMaximized || false,
      hideToolbar: frontmatter.hideToolbar || false,
      hideContent: frontmatter.hideContent || false,
      hideAddTask: frontmatter.hideAddTask || false,
      hideTasksSection: frontmatter.hideTasksSection || false,
      hideTagsSection: frontmatter.hideTagsSection || false,
      hideWordCount: frontmatter.hideWordCount || false,
      hideReadingTime: frontmatter.hideReadingTime || false,
      hidePendingTasks: frontmatter.hidePendingTasks || false
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