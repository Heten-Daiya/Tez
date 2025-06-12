import { FC, useEffect, useRef, useCallback, useMemo, useState } from 'react'; // Added useState back for isMaximized
import Masonry from 'react-masonry-css';
import '../masonry.css';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { BatchOperationsDrawer } from './BatchOperationsDrawer';
import {
  SortableContext,
  rectSwappingStrategy, 
  useSortable
} from '@dnd-kit/sortable';
import { Note } from '../types';
import NoteCard from './NoteCard';
import { NoteCardSkeleton } from './SkeletonLoader';
import { ErrorBoundary } from './ErrorBoundary';
import { useAppContext } from '../contexts/AppContext';
import { scrollToNote } from '../utils/scrollUtils';
import { useNoteSelection } from '../hooks/useNoteSelection';
import { useMarqueeSelection } from '../hooks/useMarqueeSelection';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

type NotesGridProps = {
  isLoading: boolean;
  filteredNotes: Note[];
  notes: Note[];
  darkMode: boolean;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  deleteNote: (noteId: string) => boolean;
  addTask: (noteId: string) => void;
  updateTask: (noteId: string, taskId: string, updates: Partial<Note>) => void;
  deleteTask: (noteId: string, taskId: string) => void;
  showTasksInEmbeddedNotes: boolean;
  accentColor?: string;
  editingNoteId?: string | null; // Added to track the note being edited for color changes etc.
  isGridMaximized: boolean; // Changed to be a prop
  onMaximizeToggle: () => void; // Changed to be a prop
  // onNavigateToNote is for parent overriding, internal navigation uses handleNavigate directly
};

const SortableItem: FC<NotesGridProps & { id: string }> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    position: isDragging ? 'relative' : undefined,
    // Add these styles to improve animation
    width: '100%',
    height: '100%'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} data-note-id={props.id}>
      <ErrorBoundary fallback={
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm">
          <h3 className="font-bold">Error in Note Card</h3>
          <p>There was an error rendering this note. Please try refreshing the page.</p>
        </div>
      }>
        <NoteCard
          {...props} // Spread all props from SortableItem
          allNotes={props.notes} // Explicitly map SortableItem's 'notes' prop to NoteCard's 'allNotes' prop
          dragHandleProps={{...listeners}}
          onNavigateToNote={props.onNavigateToNote || handleNavigate} // Pass down navigation handler
          // Note: editingNoteId is not directly passed to NoteCard, it's used by NotesGrid for scrolling logic
        />
      </ErrorBoundary>
    </div>
  );
};

export const NotesGrid: FC<NotesGridProps> = ({
  isLoading,
  filteredNotes,
  notes,
  darkMode,
  updateNote,
  deleteNote,
  addTask,
  updateTask,
  deleteTask,
  showTasksInEmbeddedNotes,
  accentColor = 'bg-indigo-600',
  editingNoteId,
  onNavigateToNote,
  isGridMaximized, // Destructure new prop
  onMaximizeToggle // Destructure new prop
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Get sort option and direction from context
  const { sortOption, sortDirection } = useAppContext();

  // Handler for wiki link navigation
  const handleNavigate = (noteTitle: string) => {
    if (onNavigateToNote) {
      onNavigateToNote(noteTitle);
    } else {
      // Fallback behavior if no specific handler is passed from parent
      // For example, find the note and scroll to it, or set it as active
      const targetNote = notes.find(n => n.title === noteTitle);
      if (targetNote) {
        console.log(`Navigating to note: ${targetNote.title} (ID: ${targetNote.id})`);
        // Scroll to the target note
        scrollToNote(targetNote.id, 'center');
      } else {
        console.warn(`Note with title "${noteTitle}" not found for navigation.`);
      }
    }
  };

  // Sort notes based on the selected sort option
  const sortedNotes = useMemo(() => {
    const notes = [...filteredNotes];
    
    const sortFn = (a: Note, b: Note): number => {
      let result = 0;
      
      switch (sortOption) {
        case 'title':
          result = a.title.localeCompare(b.title);
          break;
        
        case 'dateCreated':
          result = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        
        case 'size':
          const sizeA = a.content.length + (a.tasks?.length || 0) * 50;
          const sizeB = b.content.length + (b.tasks?.length || 0) * 50;
          result = sizeB - sizeA;
          break;
        
        case 'contentLength':
          result = b.content.length - a.content.length;
          break;
        
        case 'taskCount':
          result = (b.tasks?.length || 0) - (a.tasks?.length || 0);
          break;
        
        case 'pendingTaskCount':
          const pendingA = a.tasks?.filter(task => !task.completed)?.length || 0;
          const pendingB = b.tasks?.filter(task => !task.completed)?.length || 0;
          result = pendingB - pendingA;
          break;
        
        case 'position':
        default:
          result = (a.position ?? 0) - (b.position ?? 0);
          break;

        case 'color':
          result = a.color.localeCompare(b.color);
          break;
      }
      
      // Reverse the sort order if direction is descending
      return sortDirection === 'desc' ? -result : result;
    };
    
    return notes.sort(sortFn);
  }, [filteredNotes, sortOption, sortDirection]);
  
  const items = useMemo(() => sortedNotes.map(note => note.id), [sortedNotes]);

  const {
    selectedNotes,
    setSelectedNotes, // Keep for useMarqueeSelection
    handleNoteSelect,
    handleSelectAll,
    handleSelectNone,
    handleInvertSelection,
    handleSelectAfter,
    handleSelectBefore,
    handleSelectVisible,
    handleBatchDelete,
    handleSelectBetween, // Add new handler from useNoteSelection
  } = useNoteSelection({ items, deleteNote });

  const {
    isMarqueeSelectionActive,
    marqueeStart,
    marqueeEnd,
    handleToggleMarqueeSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMarqueeSelection({ gridRef, items, setSelectedNotes });

  const {
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    sensors,
    collisionDetectionStrategy,
  } = useDragAndDrop({ items, sortedNotes, updateNote });

  // Initialize positions if not set
  useEffect(() => {
    const notesWithoutPosition = filteredNotes.filter(note => typeof note.position !== 'number');
    if (notesWithoutPosition.length > 0) {
      notesWithoutPosition.forEach((note, index) => {
        const position = filteredNotes.length - notesWithoutPosition.length + index;
        updateNote(note.id, { position });
      });
    }
  }, [filteredNotes, updateNote]); // Added updateNote to dependency array

  


  // Effect to scroll to the editing note if sort changes its position
  useEffect(() => {
    if (editingNoteId && sortedNotes.some(note => note.id === editingNoteId)) {
      // Delay slightly to ensure DOM updates after sort
      setTimeout(() => scrollToNote(editingNoteId, 'center'), 100);
    }
  }, [editingNoteId, sortOption, sortDirection, sortedNotes]);


  // Determine breakpoint columns based on maximized state
  const breakpointColumnsObj = isGridMaximized // Use isGridMaximized
    ? {
        default: 1,
        1536: 1,
        1280: 1,
        1024: 1,
        768: 1,
        640: 1
      }
    : {
        default: 4,
        1536: 3,
        1280: 3,
        1024: 2,
        768: 2,
        640: 1
      };

  return (
    <div 
      className={`masonry-wrapper relative ${isMarqueeSelectionActive ? 'cursor-crosshair' : ''}`} // Use isGridMaximized
      ref={gridRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <BatchOperationsDrawer
        selectedNotes={selectedNotes}
        onBatchDelete={handleBatchDelete}
        darkMode={darkMode}
        allNotes={items}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        onInvertSelection={handleInvertSelection}
        onSelectAfter={handleSelectAfter}
        onSelectBefore={handleSelectBefore}
        onSelectVisible={handleSelectVisible}
        onToggleMarqueeSelection={handleToggleMarqueeSelection}
        isMarqueeSelectionActive={isMarqueeSelectionActive}
        onSelectBetween={handleSelectBetween} // Pass the new handler
      />
      
      {/* Marquee selection overlay - Moved from BatchOperationsDrawer */}
      {isMarqueeSelectionActive && marqueeStart && marqueeEnd && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
          style={{
            left: Math.min(marqueeStart.x, marqueeEnd.x) + 'px',
            top: Math.min(marqueeStart.y, marqueeEnd.y) + 'px',
            width: Math.abs(marqueeEnd.x - marqueeStart.x) + 'px',
            height: Math.abs(marqueeEnd.y - marqueeStart.y) + 'px'
          }}
        />
      )}
      
      {/* Marquee selection overlay */}
      {marqueeStart && marqueeEnd && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none z-10"
          style={{
            left: Math.min(marqueeStart.x, marqueeEnd.x) + 'px',
            top: Math.min(marqueeStart.y, marqueeEnd.y) + 'px',
            width: Math.abs(marqueeEnd.x - marqueeStart.x) + 'px',
            height: Math.abs(marqueeEnd.y - marqueeStart.y) + 'px'
          }}
        />
      )}
      {isLoading ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="mb-4">
              <NoteCardSkeleton />
            </div>
          ))}
        </Masonry>
      ) : (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={items}
              strategy={rectSwappingStrategy} // Change this to rectSwappingStrategy
            >
              <Masonry
                key={items.join('-')}
                breakpointCols={isGridMaximized // Use isGridMaximized
                  ? {
                      default: 1,
                      1024: 1,
                      768: 1,
                      640: 1
                    }
                  : {
                      default: 3,
                      1024: 3,
                      768: 2,
                      640: 1
                    }
                }
                className={`masonry-grid ${isGridMaximized ? 'maximized-view' : ''}`} // Use isGridMaximized
                columnClassName="masonry-grid_column"
                style={{
                  gap: '16px',
                  width: isGridMaximized ? '100%' : 'auto' // Use isGridMaximized
                }}
              >
                {items.map(id => {
  const note = notes.find(n => n.id === id);
  return note ? (
                  <SortableItem
                    // Pass all original NotesGridProps down
                    isLoading={isLoading}
                    filteredNotes={filteredNotes} 
                    notes={notes} // Pass all notes for context in NoteCard
                    darkMode={darkMode}
                    updateNote={updateNote}
                    deleteNote={deleteNote} // Pass the original deleteNote for SortableItem
                    addTask={addTask}
                    updateTask={updateTask}
                    deleteTask={deleteTask} // Pass the original deleteTask for SortableItem
                    showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
                    accentColor={accentColor}
                    editingNoteId={editingNoteId}
                    // SortableItem specific props
                    key={note.id}
                    id={note.id}
                    // note={note} // This is part of NotesGridProps, but SortableItem expects it directly
                    // allNotes={notes} // This is part of NotesGridProps
                    onSelect={handleNoteSelect} // From useNoteSelection
                    isSelected={selectedNotes.includes(note.id)} // From useNoteSelection
                    isGridMaximized={isGridMaximized} // Pass isGridMaximized
                    onMaximizeToggle={onMaximizeToggle} // Pass the global toggle
                    onNavigateToNote={handleNavigate} // Pass navigation handler
                    // Add the note prop specifically for NoteCard within SortableItem
                    note={note} 
                  />
                ) : null;
              })}
              </Masonry>
            </SortableContext>
            <DragOverlay adjustScale={true} zIndex={1000}>
              {activeId ? (
                <ErrorBoundary fallback={
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl shadow-sm">
                    <h3 className="font-bold">Error in Note Card</h3>
                    <p>There was an error rendering this note. Please try refreshing the page.</p>
                  </div>
                }>
                  <div className="drag-overlay-wrapper" style={{ opacity: 0.8, transform: 'scale(1.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <NoteCard
                      note={notes.find(note => note.id === activeId)!}
                      updateNote={updateNote}
                      deleteNote={deleteNote}
                      addTask={addTask}
                      updateTask={updateTask}
                      deleteTask={deleteTask}
                      allNotes={notes}
                      showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
                      accentColor={accentColor}
                    />
                  </div>
                </ErrorBoundary>
              ) : null}
            </DragOverlay>
          </DndContext>
      )}

      {!isLoading && (
        <>
          {notes.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No notes yet. Create your first note by clicking the "New Note" button.
              </p>
            </div>
          )}

          {notes.length > 0 && filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                No notes match your search. Try a different query.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
