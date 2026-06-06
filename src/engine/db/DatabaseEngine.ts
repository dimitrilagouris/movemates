// --- Types & Interfaces ---

export interface Landmark {
    x: number;
    y: number;
    z: number;
    visibility?: number;
}

export interface LandmarkFrame {
    videoTime: number;
    // Allows dynamic keys like 'landmarks' or 'worldLandmarks'
    [key: string]: Landmark[][] | number | undefined;
}

export interface AppSettings {
    userName: string;
    filterMethod: 'global' | 'local';
    localFilters: Record<string, unknown>;
    filterType: 'OneEuro' | 'IIR' | 'Freqz';
    sampleRate: number;
    mincutoff: number;
    beta_: number;
    dcutoff: number;
    IIRB: number[];
    IIRA: number[];
    fftGranularity: number;
    freqResponse: number[];
    throwingArm: 'Right' | 'Left';
    swingAngle: number;
}

export type StoreName =
    | 'recordings'
    | 'landmarks'
    | 'worldLandmarks'
    | 'landmarksFiltered'
    | 'worldLandmarksFiltered'
    | 'attemptsData'
    | 'settings';

export const DEFAULT_SETTINGS: AppSettings = {
    filterMethod: 'global',
    localFilters: {},
    filterType: 'OneEuro',
    sampleRate: 30,
    mincutoff: 1.0,
    beta_: 0.001,
    dcutoff: 1.0,
    IIRB: [0.0],
    IIRA: [0.0],
    fftGranularity: 128,
    freqResponse: [0.0],
    throwingArm: 'Right',
    swingAngle: 100,
    userName: 'Mover'
};

// --- Database Engine ---

/**
 * Handles all direct interactions with the IndexedDB storage.
 */
export class DatabaseEngine {
    private readonly dbName = 'movesense-recordings';
    private readonly version = 3;

    private async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.dbName, this.version);

            req.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
                const db = (ev.target as IDBOpenDBRequest).result;
                const stores: StoreName[] = [
                    'recordings', 'landmarks', 'worldLandmarks',
                    'landmarksFiltered', 'worldLandmarksFiltered',
                    'attemptsData', 'settings'
                ];

                stores.forEach(store => {
                    if (!db.objectStoreNames.contains(store)) {
                        db.createObjectStore(store, { keyPath: 'id' });
                    }
                });
            };

            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    private async getFromStore<T>(storeName: StoreName, key: string, extractKey: string): Promise<T | null> {
        try {
            const db = await this.openDB();
            return await new Promise((resolve, reject) => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const req = store.get(key);

                req.onsuccess = () => {
                    db.close();
                    resolve(req.result ? req.result[extractKey] : null);
                };
                req.onerror = () => {
                    db.close();
                    reject(req.error);
                };
            });
        } catch (err) {
            console.error(`DB read error for ${storeName}:`, err);
            return null;
        }
    }

    /**
     * Saves a video blob to the recordings store for future analysis.
     */
    public async saveRecordingBlob(blob: Blob, key: string = 'lastRecording'): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('recordings', 'readwrite');
            const store = tx.objectStore('recordings');

            const req = store.put({
                id: key,
                blob: blob,
                updatedAt: Date.now()
            });

            req.onsuccess = () => {
                db.close();
                resolve();
            };
            req.onerror = () => {
                db.close();
                reject(req.error);
            };
        });
    }

    public async getRecordingBlob(key: string = 'lastRecording'): Promise<Blob | null> {
        return this.getFromStore<Blob>('recordings', key, 'blob');
    }

    public async saveAttemptsData(key: string, attempts: unknown[]): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('attemptsData', 'readwrite');
            const store = tx.objectStore('attemptsData');

            const req = store.put({
                id: key,
                attempts: attempts,
                updatedAt: Date.now()
            });

            req.onsuccess = () => {
                db.close();
                resolve();
            };
            req.onerror = () => {
                db.close();
                reject(req.error);
            };
        });
    }

    public async getLandmarks(storeName: StoreName, key: string): Promise<LandmarkFrame[] | null> {
        // Assume 'worldLandmarks' key contains world data, otherwise 'landmarks'
        const extractKey = storeName.includes('world') ? 'worldLandmarks' : 'landmarks';
        return this.getFromStore<LandmarkFrame[]>(storeName, key, extractKey);
    }

    public async getAttempts(storeName: StoreName, key: string): Promise<unknown[] | null> {
        return this.getFromStore<unknown[]>(storeName, key, 'attempts');
    }

    public async loadSettings(): Promise<AppSettings> {
        const settings = await this.getFromStore<Partial<AppSettings>>('settings', 'userSettings', 'settings');
        return { ...DEFAULT_SETTINGS, ...settings };
    }

    public async saveSettings(settings: Partial<AppSettings>): Promise<void> {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readwrite');
            const store = tx.objectStore('settings');

            const req = store.put({
                id: 'userSettings',
                settings: settings,
                updatedAt: Date.now()
            });

            req.onsuccess = () => {
                db.close();
                resolve();
            };
            req.onerror = () => {
                db.close();
                reject(req.error);
            };
        });
    }
}