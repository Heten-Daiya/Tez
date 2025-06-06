import React, { useState } from 'react';
import { X, Search, Settings as SettingsIcon, Keyboard, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { TaskDisplaySettings, DatabaseSettings, DatabaseType } from '../types';
import { Tabs } from './ui/Tabs';
import AppSettings from './settings/AppSettings';
import NotesSettings from './settings/NotesSettings';
import HotkeysSettings from './settings/HotkeysSettings';

interface SettingsModalProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  showTasksInEmbeddedNotes: boolean;
  setShowTasksInEmbeddedNotes: (show: boolean) => void;
  showTagsInEmbeddedNotes: boolean;
  setShowTagsInEmbeddedNotes: (show: boolean) => void;
  taskDisplaySettings: TaskDisplaySettings;
  setTaskDisplaySettings: (settings: TaskDisplaySettings) => void;
  accentColor?: string;
  setAccentColor?: (color: string) => void;
  backgroundImage?: string;
  setBackgroundImage?: (imagePath: string) => void;
  databaseSettings?: DatabaseSettings;
  setDatabaseSettings?: (settings: DatabaseSettings) => void;
  onClose: () => void;
}

const SettingsModalInner: React.FC<SettingsModalProps> = ({
  darkMode,
  toggleDarkMode,
  showTasksInEmbeddedNotes,
  setShowTasksInEmbeddedNotes,
  showTagsInEmbeddedNotes,
  setShowTagsInEmbeddedNotes,
  taskDisplaySettings,
  setTaskDisplaySettings,
  accentColor = 'bg-indigo-600',
  setAccentColor = () => {},
  backgroundImage,
  setBackgroundImage = () => {},
  databaseSettings = {
    type: DatabaseType.SQLite,
    database: 'notes.db',
    enabled: false,
    host: 'localhost',
    port: 5432,
    username: '',
    password: ''
  },
  setDatabaseSettings = () => {},
  onClose
}) => {  
  const [searchTerm, setSearchTerm] = useState('');
  
  // State to track which sections are open
  const [openSections, setOpenSections] = useState({
    appearance: true,
    tasks: false,
    taskDisplay: false,
    database: false
  });
  
  // Toggle section open/closed state
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
    <div className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto`}>
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Close settings"
      >
        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>
      
      <Tabs 
        tabs={[
          {
            title: "App",
            icon: <SettingsIcon className="h-4 w-4" />,
            children: (
              <div className="pt-2">
                {/* Search field */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <AppSettings 
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  backgroundImage={backgroundImage}
                  setBackgroundImage={setBackgroundImage}
                  databaseSettings={databaseSettings}
                  setDatabaseSettings={setDatabaseSettings}
                  searchTerm={searchTerm}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />
              </div>
            ),
          },
          {
            title: "Notes",
            icon: <FileText className="h-4 w-4" />,
            children: (
              <div className="pt-2">
                {/* Search field */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search settings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <NotesSettings 
                  darkMode={darkMode}
                  accentColor={accentColor}
                  showTasksInEmbeddedNotes={showTasksInEmbeddedNotes}
                  setShowTasksInEmbeddedNotes={setShowTasksInEmbeddedNotes}
                  showTagsInEmbeddedNotes={showTagsInEmbeddedNotes}
                  setShowTagsInEmbeddedNotes={setShowTagsInEmbeddedNotes}
                  taskDisplaySettings={taskDisplaySettings}
                  setTaskDisplaySettings={setTaskDisplaySettings}
                  searchTerm={searchTerm}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />
              </div>
            ),
          },
          {
            title: "Hotkeys",
            icon: <Keyboard className="h-4 w-4" />,
            children: (
              <div className="pt-2">
                {/* Search field */}
                <div className="mb-4 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                
                <HotkeysSettings 
                  darkMode={darkMode}
                  accentColor={accentColor}
                  searchTerm={searchTerm}
                />
              </div>
            )
          }
        ]}
        darkMode={darkMode}
        accentColor={accentColor}
      />
       
       <div className="mt-6 flex justify-end">
          <Button
            onClick={onClose}
            variant={darkMode ? 'secondary' : 'outline'}
            className={accentColor.includes('indigo') ? '' : `hover:bg-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-100 dark:hover:bg-${accentColor.replace(/^bg-([a-z]+).*$/, '$1')}-900`}
          >
            Close Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = React.memo(SettingsModalInner);
export default SettingsModal;
