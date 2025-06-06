import React, { useState } from 'react';

interface TabProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabProps[];
  defaultActiveTab?: number;
  darkMode?: boolean;
  accentColor?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab = 0,
  darkMode = false,
  accentColor = 'bg-indigo-600',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  
  // Extract color name from the bg class for text and border colors
  const colorName = accentColor.replace(/^bg-([a-z]+).*$/, '$1');
  const textColorClass = `text-${colorName}-600 dark:text-${colorName}-400`;
  const borderColorClass = `border-${colorName}-600 dark:border-${colorName}-400`;
  
  return (
    <div className="w-full">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-1
                ${activeTab === index 
                  ? `${borderColorClass} ${textColorClass}` 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
              `}
              aria-current={activeTab === index ? 'page' : undefined}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab] && tabs[activeTab].children}
      </div>
    </div>
  );
};