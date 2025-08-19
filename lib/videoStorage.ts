// Utilitaires IndexedDB pour stocker les vidéos de façon persistante
// Évite les limites de localStorage et les blob URLs expirées

const DB_NAME = 'WinstoryVideos';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

export const storeVideoInIndexedDB = async (videoId: string, videoFile: File): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(videoFile, videoId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getVideoFromIndexedDB = async (videoId: string): Promise<File | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(videoId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get video from IndexedDB:', error);
    return null;
  }
};

export const deleteVideoFromIndexedDB = async (videoId: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(videoId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to delete video from IndexedDB:', error);
  }
};

export const generateVideoId = (): string => {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Nettoie les anciennes vidéos (garde seulement les 5 plus récentes)
export const cleanupOldVideos = async (): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Récupère toutes les clés
    const keys = await new Promise<string[]>((resolve, reject) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
    
    // Trie par timestamp (plus récent en premier)
    const sortedKeys = keys
      .filter(key => key.startsWith('video_'))
      .sort((a, b) => {
        const timestampA = parseInt(a.split('_')[1]);
        const timestampB = parseInt(b.split('_')[1]);
        return timestampB - timestampA;
      });
    
    // Supprime toutes les vidéos sauf les 5 plus récentes
    const keysToDelete = sortedKeys.slice(5);
    
    for (const key of keysToDelete) {
      await deleteVideoFromIndexedDB(key);
      console.log('Deleted old video:', key);
    }
    
    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} old videos from IndexedDB`);
    }
  } catch (error) {
    console.error('Failed to cleanup old videos:', error);
  }
}; 