import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Accordion } from '../ui/Accordion';

interface ShortcutItemProps {
  action: string;
  shortcut: string;
  description?: string;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ action, shortcut, description }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <div className="font-medium">{action}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>
      <div className="flex items-center space-x-1">
        {shortcut.split('+').map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">+</span>}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {key.trim()}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

interface HotkeysSettingsProps {
  darkMode: boolean;
  accentColor: string;
  searchTerm: string;
}

const HotkeysSettings: React.FC<HotkeysSettingsProps> = ({ 
  darkMode,
  accentColor,
  searchTerm
}) => {
  const [openSections, setOpenSections] = useState({
    general: true,
    editor: false,
    navigation: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Keyboard className="h-5 w-5" />
        <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
      </div>
      
      <div className="space-y-4">
        {/* General Shortcuts */}
        <Accordion
          title="General"
          isOpen={openSections.general}
          onToggle={() => toggleSection('general')}
          darkMode={darkMode}
          accentColor={accentColor}
          searchTerm={searchTerm}
          searchableText="general shortcuts new note save search settings"
        >
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            <ShortcutItem action="New Note" shortcut="Ctrl+N" description="Create a new note" />
            <ShortcutItem action="Save" shortcut="Ctrl+S" description="Save current note" />
            <ShortcutItem action="Search" shortcut="Ctrl+F" description="Search in notes" />
            <ShortcutItem action="Settings" shortcut="Ctrl+," description="Open settings" />
          </div>
        </Accordion>
        
        {/* Editor Shortcuts */}
        <Accordion
          title="Editor"
          isOpen={openSections.editor}
          onToggle={() => toggleSection('editor')}
          darkMode={darkMode}
          accentColor={accentColor}
          searchTerm={searchTerm}
          searchableText="editor shortcuts formatting bold italic code list heading link"
        >
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            <ShortcutItem action="Bold" shortcut="Ctrl+B" />
            <ShortcutItem action="Italic" shortcut="Ctrl+I" />
            <ShortcutItem action="Strikethrough" shortcut="Ctrl+Shift+S" />
            <ShortcutItem action="Code" shortcut="Ctrl+E" />
            <ShortcutItem action="Link" shortcut="Ctrl+K" />
            <ShortcutItem action="Heading 1" shortcut="Ctrl+1" />
            <ShortcutItem action="Heading 2" shortcut="Ctrl+2" />
            <ShortcutItem action="Heading 3" shortcut="Ctrl+3" />
            <ShortcutItem action="Bullet List" shortcut="Ctrl+Shift+8" />
            <ShortcutItem action="Numbered List" shortcut="Ctrl+Shift+7" />
            <ShortcutItem action="Task List" shortcut="Ctrl+Shift+T" />
            <ShortcutItem action="Blockquote" shortcut="Ctrl+Shift+." />
          </div>
        </Accordion>
        
        {/* Navigation Shortcuts */}
        <Accordion
          title="Navigation"
          isOpen={openSections.navigation}
          onToggle={() => toggleSection('navigation')}
          darkMode={darkMode}
          accentColor={accentColor}
          searchTerm={searchTerm}
          searchableText="navigation shortcuts next previous focus editor sidebar toggle"
        >
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 mt-2">
            <ShortcutItem action="Next Note" shortcut="Alt+Down" />
            <ShortcutItem action="Previous Note" shortcut="Alt+Up" />
            <ShortcutItem action="Focus Editor" shortcut="Alt+E" />
            <ShortcutItem action="Focus Sidebar" shortcut="Alt+S" />
            <ShortcutItem action="Toggle Sidebar" shortcut="Ctrl+\\" />
          </div>
        </Accordion>
      </div>
    </div>
  );
};

export default HotkeysSettings;