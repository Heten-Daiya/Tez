/**
 * Header component containing app navigation, search, and menu functionality
 */
import React, { useState } from 'react';
import { Layout, Search, Moon, Sun, ChevronDown, Menu, PlusCircle, Save, FilePlus, Settings, Network, Bell, SortAsc, SortDesc } from 'lucide-react';
import logoSvg from '../media/logo/SVG/Tez.svg';
import { MenuItem } from './MenuItem';
import { SortOption, useAppContext } from '../contexts/AppContext';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showNewNoteForm: () => void;
  exportNotes: () => void;
  importNotes: () => void;
  importNotesFromFiles: (files: FileList | null) => void;
  showTasksInEmbeddedNotes?: boolean;
  setShowTasksInEmbeddedNotes?: (show: boolean) => void;
  showDendrogram?: boolean;
  setShowDendrogram?: (show: boolean) => void;
  handleTestNotification: () => void;
  accentColor?: string;
}

/**
 * Application header with responsive design
 */
// Add this import if not already present
import { getAccentButtonClasses } from '../utils/accentColor';

const Header: React.FC<HeaderProps> = ({
  darkMode,
  toggleDarkMode,
  searchQuery,
  setSearchQuery,
  showNewNoteForm,
  exportNotes,
  importNotes,
  importNotesFromFiles,
  showTasksInEmbeddedNotes = true,
  setShowTasksInEmbeddedNotes = () => {},
  showDendrogram = false,
  setShowDendrogram = () => {},
  handleTestNotification,
  accentColor = 'bg-indigo-600'
}) => {
  // Get sort option from context
  const { sortOption, setSortOption, sortDirection } = useAppContext();
  
  // State for mobile menu and dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notesMenuOpen, setNotesMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  // Settings modal is now managed by the parent App component
  
  // Calculate button classes here
  const buttonClasses = getAccentButtonClasses(accentColor);
  
  // Sort option display names
  const sortOptionLabels: Record<SortOption, string> = {
    'title': 'Title',
    'dateCreated': 'Date Created',
    'size': 'Visual Size',
    'contentLength': 'Content Length',
    'taskCount': 'Task Count',
    'pendingTaskCount': 'Pending Tasks',
    'position': 'Manual Order'
  };

  return (
    <header className={`${darkMode ? 'bg-gradient-to-b from-gray-800/95 to-gray-900/80' : 'bg-gradient-to-b from-white/95 to-gray-50/90'} shadow-xs backdrop-blur-sm backdrop-saturate-150 sticky top-0 z-50 transition-all duration-300 ease-out`}>
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between space-x-4">
          {/* Logo section - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2">
            <img src={logoSvg} className="h-12 w-12" alt="App Logo" />
          {/*  <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>TEZ</h1> */}
          </div>
          
          {/* Mobile logo */}
          <div className="md:hidden">
            <img src={logoSvg} className="h-12 w-12" alt="App Logo" />
          </div>
          
          {/* Search bar - expanded on mobile */}
          <div className="flex-1 max-w-full md:max-w-lg px-2">
            <div className="relative flex items-center">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notes and tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-offset-gray-900' 
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 focus:ring-offset-2'
  }`}
                  aria-label="Search notes"
                />
              </div>
              {/* Dendrogram toggle button */}
              <button
                onClick={() => setShowDendrogram(!showDendrogram)}
                className={`ml-2 p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 ${
                  showDendrogram
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Toggle dendrogram view"
                title="Toggle 3D visualization"
              >
                <Network className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 100)}
                className={`flex items-center p-2 rounded-md transition-colors duration-200 ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Sort notes"
                title="Sort notes"
              >
                {sortDirection === 'asc' ? <SortAsc className="h-5 w-5 mr-1" /> : <SortDesc className="h-5 w-5 mr-1" />}
                <span className="text-sm">{sortOptionLabels[sortOption]} ({sortDirection})</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {sortMenuOpen && (
                <div 
                className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-md backdrop-blur-md z-10"
                onBlur={() => setNotesMenuOpen(false)}
                tabIndex={-1}
                >
                  {Object.entries(sortOptionLabels).map(([value, label]) => (
                    <MenuItem
                      key={value}
                      action={() => {
                        setSortOption(value as SortOption);
                        setSortMenuOpen(false);
                      }}
                      text={label}
                      darkMode={darkMode}
                      onClose={() => setSortMenuOpen(false)}
                      isActive={sortOption === value}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Notification test button */}
            <button
              onClick={handleTestNotification}
              className={`p-2 rounded-md transition-colors duration-200 ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Test notification"
              title="Test browser notification"
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* Notes dropdown menu */}
            <div className="relative">
              <div className="flex">
                <button
                  onClick={() => showNewNoteForm()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-l-lg shadow-xs backdrop-blur-sm text-sm font-medium ${buttonClasses.base} ${buttonClasses.hover} ${buttonClasses.active} transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-500 dark:focus:ring-offset-gray-900`}
                  aria-label="Create new note"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  New Note
                </button>
                <button
                  onClick={() => setNotesMenuOpen(!notesMenuOpen)}
                  onBlur={() => setTimeout(() => setNotesMenuOpen(false), 100)}
                  className={`inline-flex items-center px-2 py-2 border border-transparent rounded-r-lg shadow-xs backdrop-blur-sm text-sm font-medium text-white dark:text-gray-200 ${accentColor} hover:bg-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-700 dark:hover:bg-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-400 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-500 border-l border-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-500`}
                  aria-expanded={notesMenuOpen}
                  aria-haspopup="true"
                  aria-label="Notes Menu"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              {notesMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-md backdrop-blur-md z-10"
                  onBlur={() => setNotesMenuOpen(false)}
                  tabIndex={-1}
                >
                  <MenuItem
                    action={() => exportNotes()}
                    icon={Save}
                    text="Export Notes"
                    darkMode={darkMode}
                    onClose={() => setNotesMenuOpen(false)}
                  />
                  <MenuItem
                    action={() => importNotes()}
                    icon={FilePlus}
                    text="Import Notes"
                    darkMode={darkMode}
                    onClose={() => setNotesMenuOpen(false)}
                  />
                  <MenuItem
                    action={() => {
                      if (typeof setShowTasksInEmbeddedNotes === 'function') {
                        setNotesMenuOpen(false);
                        const event = new CustomEvent('openSettingsModal');
                        window.dispatchEvent(event);
                      }
                    }}
                    icon={Settings}
                    text="Settings"
                    darkMode={darkMode}
                    onClose={() => setNotesMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden mt-4 pb-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="pt-4 space-y-3">
              <MenuItem
                action={() => showNewNoteForm()}
                icon={PlusCircle}
                text="New Note"
                darkMode={darkMode}
                onClose={() => setMobileMenuOpen(false)}
              />
              <div className="px-4 py-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sort Notes By:</div>
                {Object.entries(sortOptionLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSortOption(value as SortOption);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-2 py-1 text-sm rounded-md ${sortOption === value 
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <MenuItem
                action={() => exportNotes()}
                icon={Save}
                text="Export Notes"
                darkMode={darkMode}
                onClose={() => setMobileMenuOpen(false)}
              />
              <label className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/80 rounded-md cursor-pointer">
                <FilePlus className="h-5 w-5 mr-2 inline" />
                Import Notes
                <input
                  type="file"
                  multiple
                  accept=".md"
                  onChange={(e) => importNotesFromFiles(e.target.files)}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  // Use the event to communicate with parent App component
                  setMobileMenuOpen(false);
                  const event = new CustomEvent('openSettingsModal');
                  window.dispatchEvent(event);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/80 rounded-md"
              >
                <Settings className="h-5 w-5 mr-2 inline" /> Settings
              </button>
              <MenuItem
                action={() => setShowDendrogram(!showDendrogram)}
                icon={Network}
                text={`${showDendrogram ? 'Hide' : 'Show'} 3D View`}
                darkMode={darkMode}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Modal is now managed by the parent App component */}
      

    </header>
  );
};

export default Header;