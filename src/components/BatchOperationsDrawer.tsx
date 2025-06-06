import React from 'react';
import { Trash2, CheckSquare, Square, RefreshCw, ArrowDown, ArrowUp, Filter, MousePointer, GitMerge } from 'lucide-react';
import { ButtonIcon } from './ButtonIcon';

interface BatchOperationsDrawerProps {
  selectedNotes: string[];
  onBatchDelete: () => void;
  darkMode: boolean;
  allNotes: string[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onInvertSelection: () => void;
  onSelectAfter?: () => void;
  onSelectBefore?: () => void;
  onSelectVisible?: () => void;
  onToggleMarqueeSelection?: () => void;
  isMarqueeSelectionActive?: boolean;
  onSelectBetween?: () => void; // New prop for scoped select
}

export const BatchOperationsDrawer: React.FC<BatchOperationsDrawerProps> = ({
  selectedNotes,
  onBatchDelete,
  darkMode,
  allNotes,
  onSelectAll,
  onSelectNone,
  onInvertSelection,
  onSelectAfter,
  onSelectBefore,
  onSelectVisible,
  onToggleMarqueeSelection,
  isMarqueeSelectionActive = false,
  onSelectBetween
}) => {
  // Marquee selection overlay is now handled in NotesGrid.tsx
  // if (selectedNotes.length === 0 && !isMarqueeSelectionActive) return null;
  if (selectedNotes.length === 0) return null;

  return (
    <div
      className={`fixed top-16 left-0 right-0 transform transition-transform duration-300 ease-in-out ${
        selectedNotes.length > 0 ? 'translate-y-0' : '-translate-y-full'
      } ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg z-50`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
        </div>
        <div className="flex gap-2">
          <ButtonIcon
            icon={CheckSquare}
            onClick={onSelectAll}
            ariaLabel="Select all notes"
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          />
          <ButtonIcon
            icon={Square}
            onClick={onSelectNone}
            ariaLabel="Deselect all notes"
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          />
          <ButtonIcon
            icon={RefreshCw}
            onClick={onInvertSelection}
            ariaLabel="Invert selection"
            className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          />
          {onSelectAfter && (
            <ButtonIcon
              icon={ArrowDown}
              onClick={onSelectAfter}
              ariaLabel="Select notes after"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            />
          )}
          {onSelectBefore && (
            <ButtonIcon
              icon={ArrowUp}
              onClick={onSelectBefore}
              ariaLabel="Select notes before"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            />
          )}
          {onSelectVisible && (
            <ButtonIcon
              icon={Filter}
              onClick={onSelectVisible}
              ariaLabel="Select visible notes"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            />
          )}
          {onToggleMarqueeSelection && (
            <ButtonIcon
              icon={MousePointer}
              onClick={onToggleMarqueeSelection}
              ariaLabel="Toggle marquee selection"
              className={`${isMarqueeSelectionActive ? 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300'}`}
            />
          )}
          {onSelectBetween && (
            <ButtonIcon
              icon={GitMerge} // Using GitMerge icon for Scoped Select
              onClick={onSelectBetween}
              ariaLabel="Select notes between two selected notes"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              disabled={selectedNotes.length < 2} // Disable if less than 2 notes are selected
            />
          )}
          <div className="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
          <ButtonIcon
            icon={Trash2}
            onClick={onBatchDelete}
            ariaLabel="Delete selected notes"
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
          />
        </div>
      </div>
    </div>
  );
};