<think>Wrap the `ColorPickerModal` content with the `Portal` component. This will make it render globally as well.</think>
import { NOTE_COLORS, ACCENT_COLORS } from '../utils/constants';
import Portal from './Portal'; // Import Portal

export const ColorPickerModal = ({ 
  onClose,
  onColorSelect,
  editingNoteId,
  isAccentColorPicker = false
}: {
  onClose: () => void,
  onColorSelect: (color: string) => void,
  editingNoteId: string | null,
  isAccentColorPicker?: boolean
}) => (
  <Portal>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium mb-4 dark:text-gray-100">
          {isAccentColorPicker 
            ? 'Choose Accent Color' 
            : editingNoteId 
              ? 'Change Note Color' 
              : 'Choose Note Color'}
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {(isAccentColorPicker ? ACCENT_COLORS : NOTE_COLORS).map(color => (
            <button
              key={color}
              className={`w-12 h-12 rounded-full ${color} transition-colors duration-200 hover:opacity-90 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900`}
              onClick={() => onColorSelect(color)}
              aria-label={`Select ${color} background`}
            />
          ))}
        </div>
        <button
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 rounded-md"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  </Portal>
);
