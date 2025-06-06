import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

/**
 * Accordion component for collapsible content sections
 */
const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
  titleClassName = '',
  contentClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-md ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full flex items-center justify-between p-3 text-left cursor-pointer ${titleClassName}`}
        aria-expanded={isOpen}
      >
        <div className="flex-1">{title}</div>
        <div className="flex-shrink-0 ml-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className={`p-1.5 pt-0 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;
