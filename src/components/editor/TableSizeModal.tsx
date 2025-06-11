<think>Wrap the `TableSizeModal` content with the `Portal` component. This ensures it also renders globally, similar to `NoteSelectionModal`.</think>
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext'; // Import useAppContext
import Portal from '../Portal'; // Import Portal

interface TableSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rows: number, columns: number, withHeaderRow: boolean) => void;
}

const TableSizeModal: React.FC<TableSizeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { accentColor } = useAppContext(); // Get accentColor from context
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [withHeaderRow, setWithHeaderRow] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(rows, columns, withHeaderRow);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-3xl flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Insert Table
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={columns}
                onChange={(e) => setColumns(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="headerRow"
                checked={withHeaderRow}
                onChange={(e) => setWithHeaderRow(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="headerRow" className="text-sm text-gray-700 dark:text-gray-300">
                Include header row
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 ${accentColor} text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default TableSizeModal;
