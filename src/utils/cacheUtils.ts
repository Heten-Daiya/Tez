/**
 * Utility functions for caching data in IndexedDB
 * This helps improve app startup time by storing and retrieving tez.cx data locally
 */

const DB_NAME = 'tezcx_app_cache';
const DB_VERSION = 1;
const NOTES_STORE = 'tezcx_store';
const SETTINGS_STORE = 'settings';

// Initialize the database
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    
    // Import bfcache utilities dynamically to avoid circular dependencies
    import('./bfcacheUtils').then(({ registerBFCacheHandlers }) => {
      // Register handler to close database when page is about to be frozen for bfcache
      registerBFCacheHandlers(
        undefined, // No action needed on restore
        () => {
          // Close database connection when page is about to be frozen
          if (request.result) {
            try {
              request.result.close();
            } catch (e) {
              // Ignore errors when closing
            }
          }
        }
      );
    }).catch(() => {
      // Fallback if dynamic import fails
      window.addEventListener('pagehide', () => {
        if (request.result) {
          request.result.close();
        }
      }, { once: true });
    });
  });
};

// Cache notes data
export const cacheNotes = async (notes: any[]): Promise<void> => {
  let db: IDBDatabase | null = null;
  try {
    db = await initDB();
    const tx = db.transaction(NOTES_STORE, 'readwrite');
    const store = tx.objectStore(NOTES_STORE);
    
    // Clear existing data and add new data
    store.clear();
    notes.forEach(note => store.put(note));
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        // Ensure transaction is complete before resolving
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    // Handle error silently
  } finally {
    // Ensure database connection is closed properly
    // This helps with bfcache compatibility
    if (db) {
      // Use setTimeout to ensure the transaction has time to complete
      setTimeout(() => {
        try {
          db?.close();
        } catch (e) {
          // Ignore errors when closing
        }
      }, 0);
    }
  }
};

// Retrieve cached notes
export const getCachedNotes = async (): Promise<any[]> => {
  let db: IDBDatabase | null = null;
  try {
    db = await initDB();
    const tx = db.transaction(NOTES_STORE, 'readonly');
    const store = tx.objectStore(NOTES_STORE);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => {
        // Close connection after transaction completes
        if (db) {
          setTimeout(() => db?.close(), 0);
        }
      };
    });
  } catch (error) {
    // Handle error silently
    return [];
  } finally {
    // Ensure database connection is closed if promise doesn't resolve
    if (db) {
      setTimeout(() => {
        try {
          db?.close();
        } catch (e) {
          // Ignore errors when closing
        }
      }, 100); // Slightly longer timeout to ensure transaction has time to complete
    }
  }
};

// Cache app settings
export const cacheSettings = async (key: string, value: any): Promise<void> => {
  let db: IDBDatabase | null = null;
  try {
    db = await initDB();
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    const store = tx.objectStore(SETTINGS_STORE);
    
    store.put({ key, value });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        resolve();
        // Close connection after transaction completes
        if (db) {
          setTimeout(() => db?.close(), 0);
        }
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    // Handle error silently
  } finally {
    // Ensure database connection is closed if promise doesn't resolve
    if (db) {
      setTimeout(() => {
        try {
          db?.close();
        } catch (e) {
          // Ignore errors when closing
        }
      }, 100);
    }
  }
};

// Get cached setting
export const getCachedSetting = async (key: string): Promise<any> => {
  let db: IDBDatabase | null = null;
  try {
    db = await initDB();
    const tx = db.transaction(SETTINGS_STORE, 'readonly');
    const store = tx.objectStore(SETTINGS_STORE);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => {
        // Close connection after transaction completes
        if (db) {
          setTimeout(() => db?.close(), 0);
        }
      };
    });
  } catch (error) {
    // Handle error silently
    return null;
  } finally {
    // Ensure database connection is closed if promise doesn't resolve
    if (db) {
      setTimeout(() => {
        try {
          db?.close();
        } catch (e) {
          // Ignore errors when closing
        }
      }, 100);
    }
  }
};