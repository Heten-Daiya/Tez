import React from 'react';
import { SettingsCheckbox } from './SettingsCheckbox';
import { ColorBadge } from './ColorBadge';

export const SettingsPanel = ({ 
  note,
  updateNote,
  onClose,
  accentColor = 'bg-indigo-600'
}: {
  note: Note;
  updateNote: (updates: Partial<Note>) => void;
  onClose: () => void;
  accentColor?: string;
}) => (
  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1.5 border border-gray-200 dark:border-gray-700 text-sm">
    <div className="flex flex-col gap-2">
      <ColorBadge
        color={note.color}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('openColorPicker', { detail: note.id }));
          onClose();
        }}
      />
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Visibility</div>
      <div className="flex flex-grow flex-wrap min-w-0 max-w-none">
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Toolbar"
          checked={note.hideToolbar}
          onChange={(checked) => updateNote({ hideToolbar: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Content"
          checked={note.hideContent}
          onChange={(checked) => updateNote({ hideContent: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Add Task"
          checked={note.hideAddTask}
          onChange={(checked) => updateNote({ hideAddTask: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Tasks"
          checked={note.hideTasksSection}
          onChange={(checked) => updateNote({ hideTasksSection: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Tags"
          checked={note.hideTagsSection}
          onChange={(checked) => updateNote({ hideTagsSection: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Word Count"
          checked={note.hideWordCount}
          onChange={(checked) => updateNote({ hideWordCount: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Reading Time"
          checked={note.hideReadingTime}
          onChange={(checked) => updateNote({ hideReadingTime: checked })}
          accentColor={accentColor}
        />
        </div>
        <div className="w-[176px]">
        <SettingsCheckbox
          label="Task Status"
          checked={note.hidePendingTasks}
          onChange={(checked) => updateNote({ hidePendingTasks: checked })}
          accentColor={accentColor}
        />
        </div>
      </div>
    </div>
  </div>
);
