import React from 'react';

interface ColorBadgeProps {
  color: string;
  onClick: () => void;
  backgroundImage?: string;
  onSelectImage?: () => void;
  showImageOption?: boolean;
  imageName?: string; // Added prop for image name
}

export const ColorBadge: React.FC<ColorBadgeProps> = ({ 
  color, 
  onClick, 
  backgroundImage, 
  onSelectImage, 
  showImageOption = false,
  imageName = 'Background Image' // Default name if not provided
}) => (
  <div className="flex items-center gap-2 p-1">
    <div
      className={`h-5 w-5 rounded-full ${!backgroundImage ? color : ''} border border-white/20 shadow-sm cursor-pointer hover:scale-110 transition-transform`}
      onClick={onClick}
      style={backgroundImage ? { 
        backgroundImage: `url(${backgroundImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    />
    <span className="text-gray-900 dark:text-gray-100">
      {backgroundImage 
        ? imageName 
        : color.replace(/^bg-([a-z]+).*$/, (_, p1) => p1.charAt(0).toUpperCase() + p1.slice(1))}
    </span>
    {showImageOption && (
      <button 
        onClick={onSelectImage}
        className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        {backgroundImage ? 'Change Image' : 'Select Image'}
      </button>
    )}
  </div>
);