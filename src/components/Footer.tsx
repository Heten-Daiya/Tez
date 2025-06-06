import { FC } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getFooterButtonClasses, getColorBase } from '../utils/colorUtils';

export const Footer: FC = () => {
  const { darkMode, toggleDarkMode, accentColor } = useAppContext();
  
  // Extract the base color name from the accent color class
  const baseColor = getColorBase(accentColor);
  
  return (
    <footer className="fixed bottom-0 right-0 p-4 z-50">
      <button
        onClick={toggleDarkMode}
        className={`p-3 rounded-full shadow-md backdrop-blur-md
          bg-gradient-to-br ${getFooterButtonClasses(accentColor, darkMode)}
          hover:scale-105 transition-transform duration-200`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? 
          <Sun className="h-6 w-6 text-white" /> : 
          <Moon className="h-6 w-6 text-white" />}
      </button>
    </footer>
  );
};