import { OneEuroFilter } from './OneEuroFilter';
import { type Landmark, type AppSettings, DEFAULT_SETTINGS } from '../db/DatabaseEngine';

const LANDMARK_COUNT = 33;

/**
 * Manages individual OneEuroFilters for the X, Y, and Z axes of all 33 MediaPipe landmarks.
 */
export class PoseFilter {
    private settings: AppSettings;
    private filters: Record<string, OneEuroFilter> = {};

    constructor(settings: Partial<AppSettings> = {}) {
        this.settings = { ...DEFAULT_SETTINGS, ...settings };
        this.initialiseFilters();
    }

    private initialiseFilters(): void {
        const { sampleRate, mincutoff, beta_, dcutoff } = this.settings;
        const templateFilter = new OneEuroFilter(sampleRate, mincutoff, beta_, dcutoff);

        for (let i = 0; i < LANDMARK_COUNT; i++) {
            this.filters[`${i}_x`] = templateFilter.clone();
            this.filters[`${i}_y`] = templateFilter.clone();
            this.filters[`${i}_z`] = templateFilter.clone();
        }
    }

    /**
     * Applies the smoothing filter to a full frame of landmarks.
     */
    public filterPose(landmarksArray: Landmark[], timestamp: number = performance.now()): Landmark[] {
        const filteredLandmarks: Landmark[] = [];

        for (let i = 0; i < landmarksArray.length; i++) {
            const landmark = landmarksArray[i];

            const filteredX = this.filters[`${i}_x`].filter(landmark.x, timestamp);
            const filteredY = this.filters[`${i}_y`].filter(landmark.y, timestamp);
            const filteredZ = this.filters[`${i}_z`].filter(landmark.z, timestamp);

            filteredLandmarks.push({
                x: filteredX,
                y: filteredY,
                z: filteredZ,
                visibility: landmark.visibility
            });
        }

        return filteredLandmarks;
    }

    public reset(): void {
        Object.values(this.filters).forEach(filter => filter.reset());
    }
}