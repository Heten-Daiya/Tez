/**
 * Utility functions for back/forward cache (bfcache) optimization
 * 
 * These utilities help improve the user experience by optimizing the app
 * for browser back/forward cache, which enables instant back and forward navigation.
 * 
 * Learn more: https://web.dev/articles/bfcache
 */

/**
 * Detects if the current page was loaded from bfcache
 * @param event The PageTransitionEvent from pageshow event
 * @returns boolean indicating if page was restored from bfcache
 */
export const isRestoredFromBFCache = (event: PageTransitionEvent): boolean => {
  return event.persisted;
};

/**
 * Registers handlers for bfcache events
 * @param onRestore Function to call when page is restored from bfcache
 * @param onFreeze Function to call when page is about to be frozen for bfcache
 */
export const registerBFCacheHandlers = (
  onRestore?: () => void,
  onFreeze?: () => void
): () => void => {
  const handlePageShow = (event: PageTransitionEvent) => {
    if (isRestoredFromBFCache(event) && onRestore) {
      onRestore();
    }
  };

  const handlePageHide = () => {
    if (onFreeze) {
      onFreeze();
    }
  };

  window.addEventListener('pageshow', handlePageShow);
  window.addEventListener('pagehide', handlePageHide);

  // Return cleanup function
  return () => {
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
  };
};

/**
 * Closes all open IndexedDB connections to improve bfcache compatibility
 * @param databases Array of IDBDatabase instances to close
 */
export const closeIndexedDBConnections = (databases: (IDBDatabase | null)[]): void => {
  databases.forEach(db => {
    if (db) {
      try {
        db.close();
      } catch (e) {
        // Ignore errors when closing
      }
    }
  });
};

/**
 * Checks if the browser supports bfcache
 * This is a best-effort detection as there's no direct API to check
 * @returns boolean indicating if browser likely supports bfcache
 */
export const isBFCacheSupported = (): boolean => {
  // Most modern browsers support bfcache
  // Chrome since version 96, Firefox and Safari all support it
  return true;
};