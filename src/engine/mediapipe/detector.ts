import { PoseLandmarker, FilesetResolver, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import type { LandmarksData } from '../../types/landmarks';
import { PoseFilter } from '../math/PoseFilter';
import type { Landmark, AppSettings } from '../db/DatabaseEngine';

/**
 * Wraps the MediaPipe Vision API for real-time skeletal tracking.
 * Automatically applies a 1 Euro Filter to smooth jitter from raw coordinates.
 */
export class MediaPipeDetector {
    private landmarker: PoseLandmarker | null = null;
    private filter: PoseFilter;

    constructor() {
        this.filter = new PoseFilter();
    }

    public updateSettings(settings: AppSettings): void {
        this.filter.updateSettings(settings);
    }

    public async initialise(): Promise<void> {
        if (this.landmarker) return;

        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 1
        });
    }

    public isReady(): boolean {
        return this.landmarker !== null;
    }

    /**
     * Extracts and smooths skeletal landmarks from a video frame.
     */
    public detect(video: HTMLVideoElement, timestamp: number): LandmarksData | null {
        if (!this.landmarker) return null;

        const result = this.landmarker.detectForVideo(video, timestamp);
        return this.formatAndFilterResult(result, timestamp);
    }

    private formatAndFilterResult(result: PoseLandmarkerResult, timestamp: number): LandmarksData | null {
        if (!result.landmarks || result.landmarks.length === 0) {
            return null;
        }

        // Apply mathematical smoothing to the raw output
        const rawLandmarks = result.landmarks[0] as Landmark[];
        const smoothedLandmarks = this.filter.filterPose(rawLandmarks, timestamp);

        return {
            landmarks: [smoothedLandmarks]
        };
    }

    /**
     * Clears historical smoothing data. Call this when switching videos or restarting.
     */
    public resetFilter(): void {
        this.filter.reset();
    }

    public close(): void {
        this.landmarker?.close();
        this.landmarker = null;
        this.filter.reset();
    }
}