import type {LandmarksData} from './landmarks';
import type { CalibrationTracker, BaseMovementTracker } from './movements';


export interface CalibrationUIState {
    progress: number;
    message: string;
    isComplete: boolean;
}

/**
 * The core contract that all physiotherapy movement logic classes must implement.
 * @template TTracker The specific type of tracker used by this movement.
 */
export interface MovementAnalyser<TTracker extends BaseMovementTracker> {
    /** Resets the internal state of the movement, clearing trackers and timers. */
    reset(): void;

    /** Updates the internal clock for the movement instance. */
    setTime(currentTime: number): void;

    /** Configures specific settings for the movement (e.g., throwing arm, target angles). */
    configure(settings?: any): void;

    /** Analyses a single frame of pose data to progress the calibration phase. */
    calibrate(landmarksData: LandmarksData, frameThreshold?: number): CalibrationTracker;

    /** Checks if the calibration phase has passed the initial validation checks. */
    isCalibrationValid(): boolean;

    /** Checks if the entire calibration phase has been successfully completed. */
    calibrationFinished(): boolean;

    /** Analyses a single frame of pose data to track the actual assessment movement. */
    analyse(landmarksData: LandmarksData, frameIndex?: number): TTracker;

    /** Validates if the current live pose adheres to the strict rules of the movement. */
    isPoseValid(): boolean;

    /** Checks if all required attempts for the exercise have been completed. */
    movementFinished(attempts: TTracker[]): boolean;

    /** Injects the current calibration progress UI into the provided DOM element. */
    populateCalibrationProgress(progressElement: HTMLElement): void;

    /** Injects real-time tracking metrics UI into the provided DOM element. */
    populateMetrics(metricsElement: HTMLElement): void;

    /** Injects the overall exercise progress UI into the provided DOM element. */
    populateMovementProgress(attempt: number, progressElement: HTMLElement): void;

    getCalibrationUIState(): CalibrationUIState;

    /** Tells the analyser whether the user has clicked Start/Stop */
    setRecordingState(isRecording: boolean): void;

    /** Feeds the latest frame to the active internal state */
    processFrame(landmarksData: LandmarksData, timestamp: number): void;

    /** Dynamically requests the skeleton colour based on the current state */
    getOverlayColour(): string;

    /** Returns the current tracker state */
    getTrackerState(): TTracker;

}

export interface CalibrationUIState {
    progress: number; // 0 to 100
    message: string;
    isComplete: boolean;
}