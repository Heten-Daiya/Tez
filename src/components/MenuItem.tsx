import React from 'react';

interface MenuItemProps {
  action: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  text: string;
  darkMode: boolean;
  onClose?: () => void;
  isActive?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({ 
  action, 
  icon: Icon, 
  text, 
  darkMode, 
  onClose,
  isActive = false
}) => (
  <button
    onClick={() => {
      action();
      onClose?.();
    }}
    className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : darkMode 
          ? 'text-gray-200 hover:bg-gray-700/80' 
          : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    {Icon && <Icon className="h-5 w-5 mr-2 inline" />}
    {text}
  </button>
);