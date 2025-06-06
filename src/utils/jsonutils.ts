/**
 * Utility functions for JSON operations
 */

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const safeParseJSON = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return null;
  }
};