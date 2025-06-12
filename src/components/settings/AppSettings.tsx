import React, { useState } from 'react';
import { Sun, Moon, Database, Eye, EyeOff } from 'lucide-react';
import { ToggleButton } from '../ToggleButton';
import { Accordion } from '../ui/Accordion';
import { ColorBadge } from '../ColorBadge';
import { ColorPickerModal } from '../ColorPickerModal';
import { DatabaseSettings, DatabaseType } from '../../types';

interface AppSettingsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  FX: boolean;
  toggleFX: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  backgroundImage?: string;
  setBackgroundImage: (imagePath: string) => void;
  databaseSettings: DatabaseSettings;
  setDatabaseSettings: (settings: DatabaseSettings) => void;
  searchTerm: string;
  openSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

const AppSettingsInner: React.FC<AppSettingsProps> = ({
  darkMode,
  toggleDarkMode,
  FX,
  toggleFX,
  accentColor,
  setAccentColor,
  backgroundImage,
  setBackgroundImage,
  databaseSettings,
  setDatabaseSettings,
  searchTerm,
  openSections,
  toggleSection
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageName, setImageName] = useState('Background Image');
  
  const handleImageSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Extract the file name
        setImageName(file.name);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const imagePath = event.target?.result as string;
          setBackgroundImage(imagePath);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  const handleRemoveImage = () => {
    setBackgroundImage('');
  };

  return (
    <div className="space-y-2">
      {/* Appearance Section */}
      <Accordion 
        title="Appearance Settings"
        icon={<Sun className="h-4 w-4" />}
        isOpen={openSections.appearance}
        onToggle={() => toggleSection('appearance')}
        darkMode={darkMode}
        FX={FX}
        accentColor={accentColor}
        searchTerm={searchTerm}
        searchableText="appearance dark light mode theme accent color background image wallpaper"
      >
        <div className="space-y-4 mt-2">
          {/* Dark Mode Toggle */}
          <ToggleButton
            enabled={darkMode}
            setEnabled={toggleDarkMode}
            enabledIcon={Sun}
            disabledIcon={Moon}
            label={darkMode ? 'Light Mode' : 'Dark Mode'}
            darkMode={darkMode}
            accentColor={accentColor}
          />
          <ToggleButton
            enabled={FX}
            setEnabled={toggleFX}
            enabledIcon={Eye}
            disabledIcon={EyeOff}
            label='FX'
            FX={FX}
            accentColor={accentColor}
          />
          
          {/* Accent Color */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Accent Color</p>
            <div onClick={() => setShowColorPicker(true)} className="cursor-pointer">
              <ColorBadge color={accentColor} onClick={() => setShowColorPicker(true)} />
            </div>
          </div>
          
          {/* Background Image */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Background Image</p>
            <div className="flex items-center gap-2">
              <ColorBadge 
                color={accentColor} 
                onClick={() => {}} 
                backgroundImage={backgroundImage} 
                onSelectImage={handleImageSelect} 
                showImageOption={true}
                imageName={imageName}
              />
              
              {backgroundImage && (
                <button
                  onClick={handleRemoveImage}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>
        </div>
      </Accordion>
      
      {showColorPicker && (
        <ColorPickerModal
          onClose={() => setShowColorPicker(false)}
          onColorSelect={(color) => {
            setAccentColor(color);
            setShowColorPicker(false);
          }}
          editingNoteId={null}
          isAccentColorPicker={true}
        />
      )}
      
      {/* Database Settings Section */}
      <Accordion 
        title="Database Settings"
        icon={<Database className="h-4 w-4" />}
        isOpen={openSections.database}
        onToggle={() => toggleSection('database')}
        darkMode={darkMode}
        accentColor={accentColor}
        searchTerm={searchTerm}
        searchableText="database settings connection persistence sqlite postgresql mariadb host port username password"
      >
        <p className="text-xs text-gray-500 mb-3">Configure database connection for data persistence</p>
        
        {/* Database Enable Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">Enable Database</span>
          <button
            onClick={() => setDatabaseSettings({
              ...databaseSettings,
              enabled: !databaseSettings.enabled
            })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
              databaseSettings.enabled ? accentColor : 'bg-gray-200'
            }`}
          >
            <span
              className={`${
                databaseSettings.enabled ? 'translate-x-5' : 'translate-x-1'
              } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
        
        {/* Database Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Database Type</label>
          <select
            value={databaseSettings.type}
            onChange={(e) => setDatabaseSettings({
              ...databaseSettings,
              type: e.target.value as DatabaseType
            })}
            className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            disabled={!databaseSettings.enabled}
          >
            <option value={DatabaseType.SQLite}>SQLite (Local)</option>
            <option value={DatabaseType.PostgreSQL}>PostgreSQL</option>
            <option value={DatabaseType.MariaDB}>MariaDB</option>
          </select>
        </div>
        
        {/* Database Name/Path */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Database Name</label>
          <input
            type="text"
            value={databaseSettings.database || ''}
            onChange={(e) => setDatabaseSettings({
              ...databaseSettings,
              database: e.target.value
            })}
            placeholder={databaseSettings.type === DatabaseType.SQLite ? 'notes.db' : 'database name'}
            className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            disabled={!databaseSettings.enabled}
          />
        </div>
        
        {/* Connection Details - Only show for non-SQLite */}
        {databaseSettings.type !== DatabaseType.SQLite && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Host</label>
                <input
                  type="text"
                  value={databaseSettings.host || ''}
                  onChange={(e) => setDatabaseSettings({
                    ...databaseSettings,
                    host: e.target.value
                  })}
                  placeholder="localhost"
                  className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  disabled={!databaseSettings.enabled}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Port</label>
                <input
                  type="number"
                  value={databaseSettings.port || ''}
                  onChange={(e) => setDatabaseSettings({
                    ...databaseSettings,
                    port: parseInt(e.target.value) || undefined
                  })}
                  placeholder={databaseSettings.type === DatabaseType.PostgreSQL ? '5432' : '3306'}
                  className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  disabled={!databaseSettings.enabled}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                value={databaseSettings.username || ''}
                onChange={(e) => setDatabaseSettings({
                  ...databaseSettings,
                  username: e.target.value
                })}
                placeholder="username"
                className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                disabled={!databaseSettings.enabled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={databaseSettings.password || ''}
                onChange={(e) => setDatabaseSettings({
                  ...databaseSettings,
                  password: e.target.value
                })}
                placeholder="••••••••"
                className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                disabled={!databaseSettings.enabled}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Connection String (Optional)</label>
              <input
                type="text"
                value={databaseSettings.connectionString || ''}
                onChange={(e) => setDatabaseSettings({
                  ...databaseSettings,
                  connectionString: e.target.value
                })}
                placeholder="Full connection string (overrides individual settings)"
                className={`w-full p-2 rounded-md border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                disabled={!databaseSettings.enabled}
              />
            </div>
          </div>
        )}
        
        {/* Migrate to Section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium mb-2">Migrate To</p>
          <div className="flex space-x-2">
            <button
              onClick={() => console.log('Migrate to Local Store clicked')}
              className={`px-3 py-1 text-xs rounded-md border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} ${accentColor ? `text-${accentColor.split('-')[1]}-600 dark:text-${accentColor.split('-')[1]}-400 border-${accentColor.split('-')[1]}-500 hover:bg-${accentColor.split('-')[1]}-100 dark:hover:bg-${accentColor.split('-')[1]}-700` : 'text-indigo-600 dark:text-indigo-400 border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-700'}`}
            >
              Local Storage
            </button>
            <button
              onClick={() => console.log('Migrate to Database clicked')}
              className={`px-3 py-1 text-xs rounded-md border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} ${accentColor ? `text-${accentColor.split('-')[1]}-600 dark:text-${accentColor.split('-')[1]}-400 border-${accentColor.split('-')[1]}-500 hover:bg-${accentColor.split('-')[1]}-100 dark:hover:bg-${accentColor.split('-')[1]}-700` : 'text-indigo-600 dark:text-indigo-400 border-indigo-500 hover:bg-indigo-100 dark:hover:bg-indigo-700'}`}
            >
              Database
            </button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          {databaseSettings.enabled 
            ? 'Database connection is enabled. Changes will take effect after restart.' 
            : 'Enable database to persist your notes and settings.'}
        </p>
      </Accordion>
    </div>
  );
};

const AppSettings = React.memo(AppSettingsInner);
export default AppSettings;
