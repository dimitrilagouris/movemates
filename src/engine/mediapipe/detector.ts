import { PoseLandmarker, FilesetResolver, type PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import type { LandmarksData } from '../../types/landmarks';

/**
 * Wraps the MediaPipe Vision API for real-time skeletal tracking.
 */
export class MediaPipeDetector {
    private landmarker: PoseLandmarker | null = null;

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

    public detect(video: HTMLVideoElement, timestamp: number): LandmarksData | null {
        if (!this.landmarker) return null;

        const result = this.landmarker.detectForVideo(video, timestamp);
        return this.formatResult(result);
    }

    private formatResult(result: PoseLandmarkerResult): LandmarksData | null {
        if (!result.landmarks || result.landmarks.length === 0) {
            return null;
        }

        return {
            landmarks: [result.landmarks[0]]
        };
    }

    public close(): void {
        this.landmarker?.close();
        this.landmarker = null;
    }
}