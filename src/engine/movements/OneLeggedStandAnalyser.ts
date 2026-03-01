import type { MovementAnalyser } from '../../types/MovementAnalyser.ts';
import type { LandmarksData } from '../../types/landmarks.ts';
import type { CalibrationTracker, BaseMovementTracker } from '../../types/movements.ts';

/** Metrics specifically tracked during the One-Legged Stand exercise. */
export interface OneLeggedStandTracker extends BaseMovementTracker {
    is_standing: boolean;
    lifted_leg: 'left' | 'right' | null;
    supporting_leg: 'left' | 'right' | null;
    legs_crossed: boolean;
    is_standing_history: boolean[];
    history_threshold: number;
}

/**
 * Handles the logic, calibration, and tracking for the One-Legged Stand movement.
 */
export class OneLeggedStandAnalyser implements MovementAnalyser<OneLeggedStandTracker> {
    private currentTime: number | null = null;
    private tracker: OneLeggedStandTracker | null = null;
    private calibrationTracker: CalibrationTracker | null = null;
    private exerciseAttempts: number = 1;

    public reset(): void
    public setTime(currentTime: number): void
    public configure(settings?: any): void

    public calibrate(landmarksData: LandmarksData, frameThreshold = 20): CalibrationTracker {
        throw new Error("Method not implemented.");
    }

    public isCalibrationValid(): boolean { return false; }
    public calibrationFinished(): boolean { return false; }

    public analyze(landmarksData: LandmarksData, frameIndex = 0): OneLeggedStandTracker {
        throw new Error("Method not implemented.");
    }

    public isPoseValid(): boolean { return false; }
    public movementFinished(attempts: OneLeggedStandTracker[]): boolean { return false; }

    public populateCalibrationProgress(progressElement: HTMLElement): void

    public populateMetrics(metricsElement: HTMLElement): void

    public populateMovementProgress(attempt: number, progressElement: HTMLElement): void

}