import type { MovementAnalyser } from '../../types/MovementAnalyser.ts';
import type { LandmarksData } from '../../types/landmarks.ts';
import type { CalibrationTracker, BaseMovementTracker } from '../../types/movements.ts';

/** Metrics specifically tracked during the Underarm Throw exercise. */
export interface UnderarmThrowTracker extends BaseMovementTracker {
    throwing_arm: 'left' | 'right';
    is_underarm: boolean;
    throw_valid: boolean;
    total_swing_angle: number;
    direction_state: 'backward' | 'forward' | 'neutral';
}

/**
 * Handles the logic, calibration, and tracking for the Underarm Throw movement.
 */
export class UnderarmThrowAnalyser implements MovementAnalyser<UnderarmThrowTracker> {
    private currentTime: number | null = null;
    private tracker: UnderarmThrowTracker | null = null;
    private calibrationTracker: CalibrationTracker | null = null;
    private exerciseAttempts: number = 1;

    public reset(): void
    public setTime(currentTime: number): void
    public configure(settings: { throwingArm: 'left'|'right', swingAngle: number }): void

    public calibrate(landmarksData: LandmarksData, frameThreshold = 20): CalibrationTracker {
        throw new Error("Method not implemented.");
    }

    public isCalibrationValid(): boolean {
        return false;
    }
    public calibrationFinished(): boolean {
        return false;
    }

    public analyse(landmarksData: LandmarksData, frameIndex = 0): UnderarmThrowTracker {
        throw new Error("Method not implemented.");
    }

    public isPoseValid(): boolean { return false; }
    public movementFinished(attempts: UnderarmThrowTracker[]): boolean { return false; }

    /** Validates if the elbow is correctly positioned below the shoulder and not overly bent. */
    private validateLiveTechnique(landmarksData: LandmarksData, frameIndex: number): { isValid: boolean, messages: string[] } {
        return { isValid: false, messages: [] };
    }

    /** Calculates the backward and forward peaks of the wrist to determine the total swing angle. */
    private trackSwingMotion(landmarksData: LandmarksData, frameIndex: number): void

    public populateCalibrationProgress(progressElement: HTMLElement): void

    public populateMetrics(metricsElement: HTMLElement): void

    public populateMovementProgress(attempt: number, progressElement: HTMLElement): void

}