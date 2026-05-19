import type {CalibrationUIState, MovementAnalyser} from '../../types/MovementAnalyser';
import type { LandmarksData, Landmark } from '../../types/landmarks';
import type { CalibrationTracker, BaseMovementTracker } from '../../types/movements';

// --- Pure Helper Functions ---

const LANDMARKS = {
    left_shoulder: 11, right_shoulder: 12,
    left_elbow: 13, right_elbow: 14,
    left_wrist: 15, right_wrist: 16,
    left_hip: 23, right_hip: 24,
    left_index: 19, right_index: 20
} as const;

function getCoord(data: LandmarksData, frame: number, index: number, axis: 'x' | 'y' | 'z'): number {
    return data.landmarks[frame]?.[index]?.[axis] ?? 0;
}

function getLandmark(data: LandmarksData, frame: number, index: number): Landmark {
    return data.landmarks[frame]?.[index] ?? { x: 0, y: 0, z: 0 };
}

function distance3d(p1: Landmark, p2: Landmark): number {
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
}

function updateHistory<T>(history: T[], item: T, threshold: number): void {
    history.push(item);
    if (history.length > threshold) {
        history.shift();
    }
}

function checkAllVisible(data: LandmarksData, frame: number): boolean {
    const landmarks = data.landmarks[frame];
    if (!landmarks) return false;
    return landmarks.every(lm => (lm.visibility ?? 0) > 0.5);
}

interface StanceResult {
    isCorrect: boolean;
    armspan: number;
}

function checkStance(data: LandmarksData, frame: number, threshold: number = 0.05): StanceResult {
    const leftShoulderX = getCoord(data, frame, LANDMARKS.left_shoulder, 'x');
    const rightShoulderX = getCoord(data, frame, LANDMARKS.right_shoulder, 'x');
    const leftHipX = getCoord(data, frame, LANDMARKS.left_hip, 'x');
    const rightHipX = getCoord(data, frame, LANDMARKS.right_hip, 'x');

    const shoulderMidX = (leftShoulderX + rightShoulderX) / 2;
    const hipMidX = (leftHipX + rightHipX) / 2;
    const isStandingStraight = Math.abs(shoulderMidX - hipMidX) < threshold;

    const leftWristX = getCoord(data, frame, LANDMARKS.left_wrist, 'x');
    const rightWristX = getCoord(data, frame, LANDMARKS.right_wrist, 'x');
    const leftElbowX = getCoord(data, frame, LANDMARKS.left_elbow, 'x');
    const rightElbowX = getCoord(data, frame, LANDMARKS.right_elbow, 'x');

    const leftWristBySide = Math.abs(leftWristX - leftHipX) < threshold;
    const rightWristBySide = Math.abs(rightWristX - rightHipX) < threshold;
    const leftArmStraight = Math.abs(leftWristX - leftElbowX) < threshold;
    const rightArmStraight = Math.abs(rightWristX - rightElbowX) < threshold;

    const isCorrect = isStandingStraight && leftWristBySide && rightWristBySide && leftArmStraight && rightArmStraight;

    const rightArmLen = distance3d(getLandmark(data, frame, LANDMARKS.right_shoulder), getLandmark(data, frame, LANDMARKS.right_index));
    const leftArmLen = distance3d(getLandmark(data, frame, LANDMARKS.left_shoulder), getLandmark(data, frame, LANDMARKS.left_index));
    const shoulderSpan = distance3d(getLandmark(data, frame, LANDMARKS.right_shoulder), getLandmark(data, frame, LANDMARKS.left_shoulder));

    return { isCorrect, armspan: rightArmLen + leftArmLen + shoulderSpan };
}

// --- Domain Class ---

export interface OneLeggedStandTracker extends BaseMovementTracker {
    is_standing: boolean;
    lifted_leg: 'left' | 'right' | null;
    supporting_leg: 'left' | 'right' | null;
    legs_crossed: boolean;
    is_standing_history: boolean[];
    history_threshold: number;
}

export class OneLeggedStandAnalyser implements MovementAnalyser<OneLeggedStandTracker> {
    private currentTime: number | null = null;
    private tracker: OneLeggedStandTracker | null = null;
    private calibration: CalibrationTracker | null = null;
    private exerciseAttempts: number = 1;

    /** Resets the analyser to its initial state. */
    public reset(): void {
        this.currentTime = null;
        this.tracker = null;
        this.calibration = null;
    }

    /** Updates the current processing time. */
    public setTime(currentTime: number): void {
        this.currentTime = currentTime;
    }

    public configure(settings?: unknown): void {}

    /** Processes a frame to update calibration state and establish baselines. */
    public calibrate(landmarksData: LandmarksData, frameThreshold: number = 20): CalibrationTracker {
        this.initialiseCalibrationTracker();

        const isVisible = checkAllVisible(landmarksData, 0);
        updateHistory(this.calibration!.visibility, isVisible, frameThreshold);

        const stance = checkStance(landmarksData, 0);
        updateHistory(this.calibration!.standing_straight, stance.isCorrect, frameThreshold);
        updateHistory(this.calibration!.armspan, stance.armspan, frameThreshold);

        this.processCalibrationState(frameThreshold);

        return this.calibration!;
    }

    private initialiseCalibrationTracker(): void {
        if (!this.calibration) {
            this.calibration = {
                curr_state: 0,
                total_states: 2,
                visibility: [],
                standing_straight: [],
                armspan: [],
                avg_armspan: 0,
            };
        }
    }

    private processCalibrationState(threshold: number): void {
        if (!this.calibration) return;

        const isFullyVisible = this.checkHistoryFullAndTrue(this.calibration.visibility, threshold);
        const isFullyInvisible = this.checkHistoryFullAndFalse(this.calibration.visibility, threshold);
        const isStanceCorrect = this.checkHistoryFullAndTrue(this.calibration.standing_straight, threshold);
        const isStanceIncorrect = this.checkHistoryFullAndFalse(this.calibration.standing_straight, threshold);

        if (this.calibration.curr_state === 0 && isFullyVisible) {
            this.calibration.curr_state = 1;
        } else if (this.calibration.curr_state !== 0 && isFullyInvisible) {
            this.calibration.curr_state = 0;
        } else if (this.calibration.curr_state === 1 && isStanceCorrect) {
            this.calibration.curr_state = 2;
            this.calibration.avg_armspan = this.calculateAverageArmspan();
        } else if (this.calibration.curr_state === 2 && isStanceIncorrect) {
            this.calibration.curr_state = 1;
        }
    }

    private checkHistoryFullAndTrue(history: boolean[], threshold: number): boolean {
        return history.length >= threshold && history.every(v => v === true);
    }

    private checkHistoryFullAndFalse(history: boolean[], threshold: number): boolean {
        return history.length >= threshold && history.every(v => v === false);
    }

    private calculateAverageArmspan(): number {
        if (!this.calibration || this.calibration.armspan.length === 0) return 0;
        const sum = this.calibration.armspan.reduce((a, b) => a + b, 0);
        return sum / this.calibration.armspan.length;
    }

    /** Returns true if the user has passed the initial visibility check. */
    public isCalibrationValid(): boolean {
        return (this.calibration?.curr_state ?? 0) > 0;
    }

    /** Returns true if all baseline metrics have been successfully gathered. */
    public calibrationFinished(): boolean {
        return this.calibration?.curr_state === 2;
    }

    public analyse(landmarksData: LandmarksData, frameIndex = 0): OneLeggedStandTracker {
        throw new Error("Method not implemented.");
    }

    public isPoseValid(): boolean { return false; }

    public movementFinished(attempts: OneLeggedStandTracker[]): boolean { return false; }

    /** Updates the DOM with the current calibration step directive. */
    public populateCalibrationProgress(progressElement: HTMLElement): void {
        if (!this.calibration) return;

        const state = this.calibration.curr_state;
        let directive = "Follow the on-screen instructions";

        if (state === 0) directive = "Ensure all body parts are visible to the camera.";
        if (state === 1) directive = "Stand up straight and hold both hands by your side.";
        if (state === 2) directive = "Calibration complete, please proceed with the movement exercise.";

        const progressBar = progressElement.querySelector('#calibration-progress') as HTMLProgressElement;
        const directiveText = progressElement.querySelector('#calibration-directive');

        if (progressBar) progressBar.value = state;
        if (directiveText) directiveText.textContent = directive;
    }

    public populateMetrics(metricsElement: HTMLElement): void {}

    public populateMovementProgress(attempt: number, progressElement: HTMLElement): void {}


    public getCalibrationUIState(): CalibrationUIState {
        if (!this.calibration) {
            return { progress: 0, message: "Initializing...", isComplete: false };
        }

        const state = this.calibration.curr_state;

        if (state === 0) {
            return { progress: 0, message: "Ensure all body parts are visible to the camera.", isComplete: false };
        }

        if (state === 1) {
            return { progress: 50, message: "Stand up straight and hold both hands by your side.", isComplete: false };
        }

        return { progress: 100, message: "Calibration complete, please proceed with the exercise.", isComplete: true };
    }


}

