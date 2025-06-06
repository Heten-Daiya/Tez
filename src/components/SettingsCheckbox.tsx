import React from 'react';
import { bgToTextColor, bgToRingColor } from '../utils/accentColor';

interface SettingsCheckboxProps {
  label: string;
  checked: boolean;  // Remove optional flag if present
  onChange: (checked: boolean) => void;
  accentColor?: string;
}

export const SettingsCheckbox: React.FC<SettingsCheckboxProps> = ({ 
  label, 
  checked = false,  // Add default value
  onChange,
  accentColor = 'bg-indigo-600'
}) => {
  const textColor = bgToTextColor(accentColor);
  const ringColor = bgToRingColor(accentColor);
  
  return (
    <div className="flex items-center gap-2 p-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`h-4 w-4 rounded border-gray-300 dark:border-gray-600 ${textColor} focus:ring-2 ${ringColor} dark:bg-gray-700/50 hover:${textColor} dark:hover:bg-gray-600/50 transition-colors duration-200`}
      />
      <span>{label}</span>
    </div>
  );
};