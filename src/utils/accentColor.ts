import { DEFAULT_ACCENT_COLOR } from './constants';
import { getColorBase } from './colorUtils';

/**
 * Utility functions for working with accent colors in the application
 */

/**
 * Converts a Tailwind background color class to its corresponding text color class
 * @param bgColorClass - The Tailwind background color class (e.g., 'bg-indigo-600')
 * @returns The corresponding text color class
 */
export const bgToTextColor = (bgColorClass: string): string => {
  // Use the shared getColorBase function
  const colorName = getColorBase(bgColorClass);
  if (!colorName) {
    // Use DEFAULT_ACCENT_COLOR instead of hardcoded indigo
    const defaultColorName = getColorBase(DEFAULT_ACCENT_COLOR);
    return `text-${defaultColorName}-600 dark:text-${defaultColorName}-400`;
  }
  
  return `text-${colorName}-600 dark:text-${colorName}-400`;
};

/**
 * Converts a Tailwind background color class to its corresponding border color class
 * @param bgColorClass - The Tailwind background color class (e.g., 'bg-indigo-600')
 * @returns The corresponding border color class
 */
export const bgToBorderColor = (bgColorClass: string): string => {
  // Use the shared getColorBase function
  const colorName = getColorBase(bgColorClass);
  if (!colorName) {
    // Use DEFAULT_ACCENT_COLOR instead of hardcoded indigo
    const defaultColorName = getColorBase(DEFAULT_ACCENT_COLOR);
    return `border-${defaultColorName}-600 dark:border-${defaultColorName}-400`;
  }
  
  return `border-${colorName}-600 dark:border-${colorName}-400`;
};

/**
 * Converts a Tailwind background color class to its corresponding ring color class
 * @param bgColorClass - The Tailwind background color class (e.g., 'bg-indigo-600')
 * @returns The corresponding ring color class
 */
export const bgToRingColor = (bgColorClass: string): string => {
  // Use the shared getColorBase function
  const colorName = getColorBase(bgColorClass);
  if (!colorName) {
    // Use DEFAULT_ACCENT_COLOR instead of hardcoded indigo
    const defaultColorName = getColorBase(DEFAULT_ACCENT_COLOR);
    return `ring-${defaultColorName}-600/50 dark:ring-${defaultColorName}-400/50`;
  }
  
  return `ring-${colorName}-600/50 dark:ring-${colorName}-400/50`;
};

/**
 * Applies the accent color to a button element
 * @param bgColorClass - The Tailwind background color class (e.g., 'bg-indigo-600')
 * @returns An object with CSS classes for different button states
 */
export const getAccentButtonClasses = (bgColorClass: string): { 
  base: string, 
  hover: string, 
  active: string,
  focus: string  // Add focus style
} => {
  // Use the shared getColorBase function
  const colorName = getColorBase(bgColorClass);
  if (!colorName) {
    // Use DEFAULT_ACCENT_COLOR instead of hardcoded indigo
    const defaultColorName = getColorBase(DEFAULT_ACCENT_COLOR);
    return {
      base: `bg-${defaultColorName}-600 text-white`,
      hover: `hover:bg-${defaultColorName}-700`,
      active: `active:bg-${defaultColorName}-800`
    };
  }
  
  return {
    base: `bg-${colorName}-600 text-white`,
    hover: `hover:bg-${colorName}-700`,
    active: `active:bg-${colorName}-800`,
    focus: `focus:ring-${colorName}-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900`
  };
};