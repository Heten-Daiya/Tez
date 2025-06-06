import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  darkMode?: boolean;
  accentColor?: string;
  searchTerm?: string;
  searchableText?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  icon,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  darkMode = false,
  accentColor = 'bg-indigo-600',
  searchTerm = '',
  searchableText = ''
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  
  // Determine if this is a controlled or uncontrolled component
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // If there's a search term and it matches the searchable text, force open
  const shouldForceOpen = searchTerm && searchableText && 
    searchableText.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Determine final open state (either controlled/internal or forced by search)
  const finalIsOpen = shouldForceOpen || isOpen;

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${shouldForceOpen ? 'bg-gray-50 dark:bg-gray-800/50 -mx-6 px-6 py-2 rounded' : ''}`}>
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={handleToggle}
        aria-expanded={finalIsOpen}
        role="button"
        tabIndex={0}
      >
        <h3 className="text-sm font-medium mb-0 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        <div className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
          {finalIsOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </div>
      
      {finalIsOpen && (
        <div className="mt-2 transition-all duration-200 ease-in-out">
          {children}
        </div>
      )}
    </div>
  );
};