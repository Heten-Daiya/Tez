import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { getCachedSetting, cacheSettings } from '../utils/cacheUtils';
import { DatabaseSettings, DatabaseType } from '../types';

export type MediaFile = {
  id: string;
  name: string;
  type: string;
  url: string;
};

export type SortOption = 'title' | 'dateCreated' | 'size' | 'contentLength' | 'taskCount' | 'pendingTaskCount' | 'position';

type AppContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  showTasksInEmbeddedNotes: boolean;
  setShowTasksInEmbeddedNotes: (show: boolean) => void;
  showTagsInEmbeddedNotes: boolean;
  setShowTagsInEmbeddedNotes: (show: boolean) => void;
  showDendrogram: boolean;
  setShowDendrogram: (show: boolean) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  taskDisplaySettings: TaskDisplaySettings;
  setTaskDisplaySettings: (settings: TaskDisplaySettings) => void;
  databaseSettings: DatabaseSettings;
  setDatabaseSettings: (settings: DatabaseSettings) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([]);

  const addMedia = useCallback((file: MediaFile) => {
    setMediaItems(prev => [...prev, file]);
  }, []);

  const addLocalFile = useCallback((inputFile: File): MediaFile | undefined => {
    const blobUrl = URL.createObjectURL(inputFile);
    const newFile = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: inputFile.name,
      type: inputFile.type,
      url: blobUrl
    };
    setMediaItems(prev => [...prev, newFile]);
    return newFile;
  }, []);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showTasksInEmbeddedNotes, setShowTasksInEmbeddedNotes] = useState<boolean>(true);
  const [showTagsInEmbeddedNotes, setShowTagsInEmbeddedNotes] = useState<boolean>(true);
  const [showDendrogram, setShowDendrogram] = useState<boolean>(false);
  const [accentColor, setAccentColor] = useState<string>('bg-indigo-600');
  const [sortOption, setSortOption] = useState<SortOption>('position');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [taskDisplaySettings, setTaskDisplaySettings] = useState({
    showTitle: true,
    showDescription: false,
    showPriority: true,
    showDates: false,
    showStatus: true,
    showProgress: false,
    showDependencies: false
  });
  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>({
    type: DatabaseType.SQLite,
    database: 'notes.db',
    enabled: false,
    host: 'localhost',
    port: 5432,
    username: '',
    password: ''
  });

  // Load cached settings on initial render
  useEffect(() => {
    const loadCachedSettings = async () => {
      const cachedDarkMode = await getCachedSetting('darkMode');
      if (cachedDarkMode !== null) setDarkMode(cachedDarkMode);
      
      const cachedShowTasks = await getCachedSetting('showTasksInEmbeddedNotes');
      if (cachedShowTasks !== null) setShowTasksInEmbeddedNotes(cachedShowTasks);
      
      const cachedShowTags = await getCachedSetting('showTagsInEmbeddedNotes');
      if (cachedShowTags !== null) setShowTagsInEmbeddedNotes(cachedShowTags);
      
      const cachedAccentColor = await getCachedSetting('accentColor');
      if (cachedAccentColor !== null) setAccentColor(cachedAccentColor);
      
      const cachedSortOption = await getCachedSetting('sortOption');
      if (cachedSortOption !== null) setSortOption(cachedSortOption);
      
      const cachedSortDirection = await getCachedSetting('sortDirection');
      if (cachedSortDirection !== null) setSortDirection(cachedSortDirection);
      
      const cachedDatabaseSettings = await getCachedSetting('databaseSettings');
      if (cachedDatabaseSettings !== null) setDatabaseSettings(cachedDatabaseSettings);
    };
    
    loadCachedSettings();
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    cacheSettings('darkMode', newMode);
  };

  const handleSetShowTasksInEmbeddedNotes = (show: boolean) => {
    setShowTasksInEmbeddedNotes(show);
    cacheSettings('showTasksInEmbeddedNotes', show);
  };
  
  const handleSetShowTagsInEmbeddedNotes = (show: boolean) => {
    setShowTagsInEmbeddedNotes(show);
    cacheSettings('showTagsInEmbeddedNotes', show);
  };
  
  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
    cacheSettings('accentColor', color);
  };
  
  const handleSetSortOption = (option: SortOption) => {
    if (option === sortOption) {
      // Toggle direction when selecting the same option
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      cacheSettings('sortDirection', newDirection);
    } else {
      setSortOption(option);
      cacheSettings('sortOption', option);
    }
  };
  
  const handleSetDatabaseSettings = (settings: DatabaseSettings) => {
    setDatabaseSettings(settings);
    cacheSettings('databaseSettings', settings);
  };

  const contextValue = useMemo(() => ({
    mediaItems,
    addMedia,
    addLocalFile,
    darkMode,
    toggleDarkMode,
    showTasksInEmbeddedNotes,
    setShowTasksInEmbeddedNotes: handleSetShowTasksInEmbeddedNotes,
    showTagsInEmbeddedNotes,
    setShowTagsInEmbeddedNotes: handleSetShowTagsInEmbeddedNotes,
    showDendrogram,
    setShowDendrogram,
    accentColor,
    setAccentColor: handleSetAccentColor,
    taskDisplaySettings,
    setTaskDisplaySettings,
    databaseSettings,
    setDatabaseSettings: handleSetDatabaseSettings,
    sortOption,
    setSortOption: handleSetSortOption,
    sortDirection,
    setSortDirection
  }), [
    darkMode,
    showTasksInEmbeddedNotes,
    showTagsInEmbeddedNotes,
    showDendrogram,
    accentColor,
    taskDisplaySettings,
    databaseSettings,
    sortOption,
    sortDirection,
    // Add handler functions to dependencies if they are not stable (e.g., not wrapped in useCallback)
    // For this case, the setters from useState are stable, and the custom handlers are defined in the component scope
    // so they will be recreated on each render, but useMemo will compare their references.
    // To be absolutely safe and prevent re-renders if a handler's identity changes unnecessarily,
    // they could be wrapped in useCallback, but for now, this should provide significant optimization.
    mediaItems,
    addMedia,
    addLocalFile,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
