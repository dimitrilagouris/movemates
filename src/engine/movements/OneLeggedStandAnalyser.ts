import type { CalibrationUIState, MovementAnalyser } from '../../types/MovementAnalyser';
import type { LandmarksData, Landmark } from '../../types/landmarks';
import type { CalibrationTracker, BaseMovementTracker } from '../../types/movements';

// --- Pure Helper Functions ---

const LANDMARKS = {
    left_shoulder: 11, right_shoulder: 12,
    left_elbow: 13, right_elbow: 14,
    left_wrist: 15, right_wrist: 16,
    left_hip: 23, right_hip: 24,
    left_foot_index: 31, right_foot_index: 32, // Added feet for stance checking
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

// --- State Pattern Implementations ---

interface SessionState {
    processFrame(data: LandmarksData, timestamp: number): void;
    getColour(): string;
}

class CalibratingState implements SessionState {
    constructor(private context: OneLeggedStandAnalyser) {}

    public processFrame(data: LandmarksData, timestamp: number): void {
        this.context.runCalibrationLogic(data);
    }

    public getColour(): string {
        return this.context.calibrationFinished() ? "#22c55e" : "#ef4444";
    }
}

class RecordingState implements SessionState {
    constructor(private context: OneLeggedStandAnalyser) {}

    public processFrame(data: LandmarksData, timestamp: number): void {
        this.context.runAnalysisLogic(data, timestamp);
    }

    public getColour(): string {
        return this.context.isPoseValid() ? "#22c55e" : "#ef4444";
    }
}

// --- Domain Class ---

export interface OneLeggedStandTracker extends BaseMovementTracker {
    is_standing: boolean;
    lifted_leg: 'left' | 'right' | null;
    supporting_leg: 'left' | 'right' | null;
    legs_crossed: boolean;
}

export class OneLeggedStandAnalyser implements MovementAnalyser<OneLeggedStandTracker> {
    private activeState: SessionState;
    private tracker: OneLeggedStandTracker;
    public calibration: CalibrationTracker | null = null;
    private exerciseAttempts: number = 3;
    private footDownFrames: number = 0;

    constructor() {
        this.activeState = new CalibratingState(this);
        this.tracker = this.initialiseTracker();
    }

    private initialiseTracker(): OneLeggedStandTracker {
        return {
            is_standing: false,
            lifted_leg: null,
            supporting_leg: null,
            legs_crossed: false,
            armspan: 0,
            start_time: null,
            end_time: null,
            duration: 0,
            attempt_finished: false,
            landmark_series: []
        };
    }

    public setRecordingState(isRecording: boolean): void {
        this.activeState = isRecording ? new RecordingState(this) : new CalibratingState(this);
    }

    public processFrame(landmarksData: LandmarksData, timestamp: number): void {
        this.activeState.processFrame(landmarksData, timestamp);
    }

    public getOverlayColour(): string {
        return this.activeState.getColour();
    }

    public runCalibrationLogic(landmarksData: LandmarksData, frameThreshold: number = 20): void {
        if (!this.calibration) this.initialiseCalibrationTracker();
        if (this.calibration.curr_state === 2) return;

        const isVisible = checkAllVisible(landmarksData, 0);
        updateHistory(this.calibration.visibility, isVisible, frameThreshold);

        const stance = checkStance(landmarksData, 0);
        updateHistory(this.calibration.standing_straight, stance.isCorrect, frameThreshold);
        updateHistory(this.calibration.armspan, stance.armspan, frameThreshold);

        this.processCalibrationState(frameThreshold);
    }

    /** Core analysis delegate handles timestamps and state transitions */
    public runAnalysisLogic(data: LandmarksData, timestamp: number): void {
        if (this.tracker.attempt_finished) return;

        const leftFootY = getCoord(data, 0, LANDMARKS.left_foot_index, 'y');
        const rightFootY = getCoord(data, 0, LANDMARKS.right_foot_index, 'y');
        const leftHipX = getCoord(data, 0, LANDMARKS.left_hip, 'x');
        const rightHipX = getCoord(data, 0, LANDMARKS.right_hip, 'x');
        const hipSpan = Math.abs(leftHipX - rightHipX);

        // A leg is lifted if the vertical distance between the feet is significant.
        // We use Math.max to ensure that even if hipSpan is very small (due to camera angle), 
        // a minimum vertical lift of 0.08 normalized units is required to trigger.
        const currentlyStanding = Math.abs(leftFootY - rightFootY) > Math.max(hipSpan * 1.2, 0.08);

        if (currentlyStanding) {
            this.footDownFrames = 0;
            if (!this.tracker.is_standing) {
                this.startAttempt(leftFootY, rightFootY, timestamp);
            }
            this.tracker.is_standing = true;
            this.recordActiveFrame(data, timestamp);
        } else {
            if (this.tracker.is_standing) {
                this.footDownFrames++;
                // Wait for roughly 0.5 seconds (15 frames at 30fps) of the foot being down
                // before officially ending the attempt. This prevents camera glitches from ending it early.
                if (this.footDownFrames > 15) {
                    this.finishAttempt(timestamp);
                    this.tracker.is_standing = false;
                } else {
                    this.recordActiveFrame(data, timestamp);
                }
            }
        }
    }

    /** Triggers upon first detection of raised leg */
    private startAttempt(leftFootY: number, rightFootY: number, timestamp: number): void {
        this.tracker.start_time = timestamp / 1000;
        this.tracker.armspan = this.calibration?.avg_armspan ?? 0;

        if (leftFootY < rightFootY) {
            this.tracker.lifted_leg = 'left';
            this.tracker.supporting_leg = 'right';
        } else {
            this.tracker.lifted_leg = 'right';
            this.tracker.supporting_leg = 'left';
        }
    }

    /** Completes attempt upon foot lowering, rejecting noise (short durations) */
    private finishAttempt(timestamp: number): void {
        if (this.tracker.start_time === null) return;
        
        const endTime = timestamp / 1000;
        const duration = Math.round((endTime - this.tracker.start_time) * 100) / 100;
        
        // Filter out noise (e.g. tracking flickers) by requiring at least 1 second
        if (duration < 1.0) {
            this.tracker.start_time = null;
            this.tracker.lifted_leg = null;
            this.tracker.supporting_leg = null;
            this.tracker.landmark_series = [];
            return;
        }

        this.tracker.end_time = endTime;
        this.tracker.duration = duration;
        this.tracker.attempt_finished = true;
    }

    /** Buffers the frame array while attempt is active */
    private recordActiveFrame(data: LandmarksData, timestamp: number): void {
        this.tracker.landmark_series.push({
            landmarks: data,
            timestamp: timestamp / 1000
        });

        const leftFootX = getCoord(data, 0, LANDMARKS.left_foot_index, 'x');
        const rightFootX = getCoord(data, 0, LANDMARKS.right_foot_index, 'x');

        // Monitors for incorrect stance where legs cross the midline
        if (this.tracker.lifted_leg === 'left') {
            this.tracker.legs_crossed = leftFootX > rightFootX;
        } else if (this.tracker.lifted_leg === 'right') {
            this.tracker.legs_crossed = rightFootX < leftFootX;
        }
    }

    private initialiseCalibrationTracker(): void {
        this.calibration = {
            curr_state: 0,
            total_states: 2,
            visibility: [],
            standing_straight: [],
            armspan: [],
            avg_armspan: 0,
        };
    }

    private processCalibrationState(threshold: number): void {
        if (!this.calibration || this.calibration.curr_state === 2) return;

        const isFullyVisible = this.checkHistoryFullAndTrue(this.calibration.visibility, threshold);
        const isFullyInvisible = this.checkHistoryFullAndFalse(this.calibration.visibility, threshold);
        const isStanceCorrect = this.checkHistoryFullAndTrue(this.calibration.standing_straight, threshold);

        if (this.calibration.curr_state === 0 && isFullyVisible) {
            this.calibration.curr_state = 1;
        } else if (this.calibration.curr_state === 1 && isFullyInvisible) {
            this.calibration.curr_state = 0;
        } else if (this.calibration.curr_state === 1 && isStanceCorrect) {
            this.calibration.curr_state = 2;
            this.calibration.avg_armspan = this.calculateAverageArmspan();
        }
    }

    private checkHistoryFullAndTrue(history: boolean[], threshold: number): boolean {
        return history.length >= threshold && history.every(v => v);
    }

    private checkHistoryFullAndFalse(history: boolean[], threshold: number): boolean {
        return history.length >= threshold && history.every(v => !v);
    }

    private calculateAverageArmspan(): number {
        if (!this.calibration || this.calibration.armspan.length === 0) return 0;
        const sum = this.calibration.armspan.reduce((a, b) => a + b, 0);
        return sum / this.calibration.armspan.length;
    }

    public isPoseValid(): boolean {
        return this.tracker.is_standing && !this.tracker.legs_crossed;
    }

    public calibrationFinished(): boolean {
        return this.calibration?.curr_state === 2;
    }

    public getTrackerState(): OneLeggedStandTracker {
        return this.tracker;
    }

    /**
     * Extracted from legacy code: Clones completed attempt data to the array
     * and resets the instance for the next repetition.
     */
    public movementFinished(attempts: OneLeggedStandTracker[]): boolean {
        if (this.tracker.attempt_finished) {
            attempts.push(structuredClone(this.tracker));
            this.tracker = this.initialiseTracker();
        }

        return attempts.length >= this.exerciseAttempts;
    }

    public getCalibrationUIState(): CalibrationUIState {
        if (!this.calibration) {
            return { progress: 0, message: "Initialising...", isComplete: false };
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