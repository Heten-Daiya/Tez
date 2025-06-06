import { DEFAULT_ACCENT_COLOR, FOOTER_BUTTON_COLOR_MAP } from './constants';

/**
 * Helper function to extract the base color name from a Tailwind color class
 */
export const getColorBase = (colorClass: string): string => {
  // Default to indigo if no color class is provided
  const colorToUse = colorClass || DEFAULT_ACCENT_COLOR;
  
  // Extract just the color name (e.g., 'indigo', 'blue', 'slate-gray')
  return colorToUse.replace(/^bg-([a-z]+(-[a-z]+)?).*$/, '$1');
};

/**
 * Helper function to get the appropriate gradient and shadow classes for a given accent color
 */
export const getFooterButtonClasses = (colorClass: string, isDarkMode: boolean): string => {
  // Default to indigo if no color class is provided
  const colorToUse = colorClass || DEFAULT_ACCENT_COLOR;
  
  // Use the color map from constants
  const colorMapFn = FOOTER_BUTTON_COLOR_MAP[colorToUse];
  
  // Return the mapped classes or default to indigo if the color isn't in the map
  return colorMapFn ? colorMapFn(isDarkMode) : FOOTER_BUTTON_COLOR_MAP[DEFAULT_ACCENT_COLOR](isDarkMode);
};