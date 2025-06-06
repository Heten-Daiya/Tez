import React from 'react';
import { Eye, EyeOff, ListChecks } from 'lucide-react';
import { ToggleButton } from '../ToggleButton';
import { Accordion } from '../ui/Accordion';
import { TaskDisplaySettings } from '../../types';

interface NotesSettingsProps {
  darkMode: boolean;
  accentColor: string;
  showTasksInEmbeddedNotes: boolean;
  setShowTasksInEmbeddedNotes: (show: boolean) => void;
  showTagsInEmbeddedNotes: boolean;
  setShowTagsInEmbeddedNotes: (show: boolean) => void;
  taskDisplaySettings: TaskDisplaySettings;
  setTaskDisplaySettings: (settings: TaskDisplaySettings) => void;
  searchTerm: string;
  openSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}

const NotesSettings: React.FC<NotesSettingsProps> = ({
  darkMode,
  accentColor,
  showTasksInEmbeddedNotes,
  setShowTasksInEmbeddedNotes,
  showTagsInEmbeddedNotes,
  setShowTagsInEmbeddedNotes,
  taskDisplaySettings,
  setTaskDisplaySettings,
  searchTerm,
  openSections,
  toggleSection
}) => {
  return (
    <div className="space-y-2">
      {/* Tasks Visibility Section */}
      <Accordion 
        title="Tasks & Tags Visibility"
        icon={<Eye className="h-4 w-4" />}
        isOpen={openSections.tasks}
        onToggle={() => toggleSection('tasks')}
        darkMode={darkMode}
        accentColor={accentColor}
        searchTerm={searchTerm}
        searchableText="tasks tags visibility show hide embedded notes"
      >
        <div className="space-y-4 mt-2">
          <ToggleButton
            enabled={showTasksInEmbeddedNotes}
            setEnabled={setShowTasksInEmbeddedNotes}
            enabledIcon={Eye}
            disabledIcon={EyeOff}
            label="Show Tasks in Notes"
            darkMode={darkMode}
            accentColor={accentColor}
          />

          <ToggleButton
            enabled={showTagsInEmbeddedNotes}
            setEnabled={setShowTagsInEmbeddedNotes}
            enabledIcon={Eye}
            disabledIcon={EyeOff}
            label="Show Tags in Notes"
            darkMode={darkMode}
            accentColor={accentColor}
          />
        </div>
      </Accordion>

      {/* Task Display Settings Section */}
      <Accordion 
        title="Task Display Settings"
        icon={<ListChecks className="h-4 w-4" />}
        isOpen={openSections.taskDisplay}
        onToggle={() => toggleSection('taskDisplay')}
        darkMode={darkMode}
        accentColor={accentColor}
        searchTerm={searchTerm}
        searchableText="task display settings title description priority dates status progress dependencies"
      >
        <p className="text-xs text-gray-500 mb-3">Choose which task properties to show in collapsed view</p>
        
        <div className="space-y-2">
          {/* Title Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Title</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showTitle: !taskDisplaySettings.showTitle
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showTitle ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showTitle ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Description Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Description</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showDescription: !taskDisplaySettings.showDescription
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showDescription ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showDescription ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Priority Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Priority</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showPriority: !taskDisplaySettings.showPriority
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showPriority ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showPriority ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Dates Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Dates</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showDates: !taskDisplaySettings.showDates
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showDates ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showDates ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Status</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showStatus: !taskDisplaySettings.showStatus
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showStatus ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showStatus ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Progress Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Progress</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showProgress: !taskDisplaySettings.showProgress
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showProgress ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showProgress ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
          
          {/* Dependencies Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Show Dependencies</span>
            <button
              onClick={() => setTaskDisplaySettings({
                ...taskDisplaySettings,
                showDependencies: !taskDisplaySettings.showDependencies
              })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                taskDisplaySettings.showDependencies ? accentColor : 'bg-gray-200'
              }`}
            >
              <span
                className={`${
                  taskDisplaySettings.showDependencies ? 'translate-x-5' : 'translate-x-1'
                } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
        </div>
      </Accordion>
    </div>
  );
};

export default NotesSettings;