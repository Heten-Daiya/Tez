/**
 * tez.cx - A markdown-based note-taking application with task management
 * 
 * This application allows users to:
 * - Create, edit, and delete notes with markdown support
 * - Add tasks to notes with completion tracking
 * - Link between notes using wiki-style [[Note Title]] syntax
 * - Search across all notes and tasks
 * - Import and export notes as markdown files
 * - Toggle between light and dark mode
 * - Visualize note connections in a 3D dendrogram view
 */
import { lazy, Suspense, useState } from 'react';
import { cacheSettings } from './utils/cacheUtils';
import { useAppContext } from './contexts/AppContext';
import { useNotesContext } from './contexts/NotesContext';
import { useUIState } from './hooks/useUIState';

// Import components with code splitting
import Header from './components/Header';
import { ColorPickerModal } from './components/ColorPickerModal';
import { NotesGrid } from './components/NotesGrid';
// Lazy load components that aren't needed for initial render
const DendrogramView = lazy(() => import('./components/DendrogramView'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

// Import CSS for masonry layout
import './masonry.css';

// Import types
import { Footer } from './components/Footer';

/**
 * Main application component that orchestrates the entire note-taking experience.
 * Leverages custom hooks for state management and business logic separation.
 */
function App() {
  // App-wide settings from AppContext
  const { 
    darkMode, 
    toggleDarkMode,
    FX,
    toggleFX,
    showTasksInEmbeddedNotes,
    setShowTasksInEmbeddedNotes,
    showTagsInEmbeddedNotes,
    setShowTagsInEmbeddedNotes,
    showDendrogram,
    setShowDendrogram,
    accentColor,
    setAccentColor,
    taskDisplaySettings,
    setTaskDisplaySettings,
    databaseSettings,
    setDatabaseSettings
  } = useAppContext();

  // Notes-related state and operations from NotesContext
  const {
    notes,
    filteredNotes,
    searchQuery,
    setSearchQuery,
    updateNote,
    deleteNote,
    addTask,
    updateTask,
    deleteTask,
    exportNotes: exportNotesToMarkdown,
    importNotes: importNotesFromMarkdown,
    importNotesFromFiles,
    isLoading
  } = useNotesContext();

  // UI-related state and handlers from custom hook
  const {
    editingNoteId,
    showNewNoteForm,
    settingsModalOpen,
    backgroundImage,
    setEditingNoteId,
    setShowNewNoteForm,
    setSettingsModalOpen,
    handleShowNewNoteForm,
    handleColorSelect,
    handleSetBackgroundImage
  } = useUIState()

  // State for grid maximization
  const [isGridMaximized, setIsGridMaximized] = useState<boolean>(false);

  const handleMaximizeToggle = () => {
    setIsGridMaximized(prev => !prev);
  };

  const handleTestNotification = async () => {
    if (Notification.permission === 'granted') {
      new Notification('Tez Notification', {
        body: 'This is a test notification from Tez',
        icon: '/src/media/logo/1x/tez-01.svg'
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Tez Notification', {
          body: 'Thanks for enabling notifications!',
          icon: '/src/media/logo/1x/tez-01.svg'
        });
      }
    }
  };
  
  // Event listeners for UI interactions have been moved to useUIState hook
  // Note management effects have been moved to NotesContext

  return (
    // Main application wrapper with dark mode support
    <div 
      className={`min-h-screen transition-all duration-500 ease-in-out ${darkMode ? 'dark bg-gray-900' : 'bg-gray-300'}`}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      {/* Application header with search, dark mode toggle, and import/export options */}
      <Header 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        FX={FX}
        toggleFX={toggleFX}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showNewNoteForm={handleShowNewNoteForm}
        exportNotes={exportNotesToMarkdown}
        importNotes={importNotesFromMarkdown}
        importNotesFromFiles={importNotesFromFiles}
        showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
        setShowTasksInEmbeddedNotes={setShowTasksInEmbeddedNotes}
        showDendrogram={showDendrogram}
        setShowDendrogram={setShowDendrogram}
        isGridMaximized={isGridMaximized} // Pass to Header
        onMaximizeToggle={handleMaximizeToggle} // Pass to Header
        accentColor={accentColor}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">  
        {/* 3D Dendrogram View - only shown when showDendrogram is true */}
        {showDendrogram && (
          <div className="h-screen w-full mb-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[70vh]">
                <div className="animate-pulse text-center">
                  <div className="h-32 w-32 bg-indigo-200 dark:bg-indigo-700 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
                </div>
              </div>
            }>
              <DendrogramView
                notes={notes}
                width={window.innerWidth}
                height={window.innerHeight - 100}
                onNodeSelect={(id) => {
                  const selectedNote = notes.find(n => n.id === id);
                  if (selectedNote) {
                    window.location.hash = `#note-${id}`;
                  }
                }}
                darkMode={darkMode}
              />
            </Suspense>
          </div>
        )}
        {/* Color picker modal for new notes - only shown when showNewNoteForm is true */}
        {showNewNoteForm && (
          <ColorPickerModal
            onClose={() => setShowNewNoteForm(false)}
            onColorSelect={(color) => {
              if (editingNoteId) {
                updateNote(editingNoteId, { color });
              }
              handleColorSelect(color);
            }}
            editingNoteId={editingNoteId}
          />
        )}
        
        {/* Settings Modal - Lazy loaded with Suspense */}
        {settingsModalOpen && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            </div>
          }>
            <SettingsModal 
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              FX={FX}
              toggleFX={toggleFX}
              showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
              setShowTasksInEmbeddedNotes={setShowTasksInEmbeddedNotes}
              showTagsInEmbeddedNotes={showTagsInEmbeddedNotes}
              setShowTagsInEmbeddedNotes={setShowTagsInEmbeddedNotes}
              taskDisplaySettings={taskDisplaySettings}
              setTaskDisplaySettings={setTaskDisplaySettings}
              accentColor={accentColor}
              setAccentColor={setAccentColor} // Use setAccentColor from context directly
              backgroundImage={backgroundImage}
              setBackgroundImage={handleSetBackgroundImage}
              databaseSettings={databaseSettings}
              setDatabaseSettings={setDatabaseSettings}
              onClose={() => setSettingsModalOpen(false)}
            />
          </Suspense>
        )}

        <NotesGrid
          isLoading={isLoading}
          filteredNotes={filteredNotes}
          notes={notes}
          darkMode={darkMode}
          FX={FX}
          updateNote={updateNote}
          deleteNote={deleteNote}
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
          showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
          accentColor={accentColor}
          editingNoteId={editingNoteId} // Pass editingNoteId to NotesGrid
          isGridMaximized={isGridMaximized} // Pass to NotesGrid
          onMaximizeToggle={handleMaximizeToggle} // Pass to NotesGrid
        />
      </main>
      
      {/* Use the Footer component without passing props */}
      <Footer />
    </div>
  );
}

export default App;
