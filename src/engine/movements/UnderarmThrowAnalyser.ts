import type { CalibrationUIState, MovementAnalyser } from '../../types/MovementAnalyser';
import type { LandmarksData, Landmark } from '../../types/landmarks';
import type { CalibrationTracker } from '../../types/movements';
import { UnderarmThrowTracker } from '../../types/movements';

// --- Pure Helper Functions ---

const LANDMARKS = {
    left_shoulder: 11, right_shoulder: 12,
    left_elbow: 13, right_elbow: 14,
    left_wrist: 15, right_wrist: 16,
    left_hip: 23, right_hip: 24,
    left_foot_index: 31, right_foot_index: 32,
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

function vector(p1: Landmark, p2: Landmark): Landmark {
    return {
        x: p1.x - p2.x,
        y: p1.y - p2.y,
        z: p1.z - p2.z
    };
}

function getVectorAngle(v1: Landmark, v2: Landmark): number {
    const dotProduct = (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);
    const v1Mag = Math.sqrt((v1.x * v1.x) + (v1.y * v1.y) + (v1.z * v1.z));
    const v2Mag = Math.sqrt((v2.x * v2.x) + (v2.y * v2.y) + (v2.z * v2.z));
    const angleRad = Math.acos(dotProduct / (v1Mag * v2Mag));
    return angleRad * (180 / Math.PI);
}

function jointAngle(p1: number[], p2: number[], p3: number[]): number {
    const v1 = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];
    const v2 = [p3[0] - p2[0], p3[1] - p2[1], p3[2] - p2[2]];
    const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
    const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
    return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
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

function checkStance(data: LandmarksData, frame: number = 0, threshold: number = 0.05): StanceResult {
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
    constructor(private context: UnderarmThrowAnalyser) {}

    public processFrame(data: LandmarksData, timestamp: number): void {
        this.context.runCalibrationLogic(data);
    }

    public getColour(): string {
        return this.context.calibrationFinished() ? "#22c55e" : "#ef4444";
    }
}

class RecordingState implements SessionState {
    constructor(private context: UnderarmThrowAnalyser) {}

    public processFrame(data: LandmarksData, timestamp: number): void {
        this.context.runAnalysisLogic(data, timestamp);
    }

    public getColour(): string {
        return this.context.isPoseValid() ? "#22c55e" : "#ef4444";
    }
}

// --- Domain Class ---

export class UnderarmThrowAnalyser implements MovementAnalyser<UnderarmThrowTracker> {
    private activeState: SessionState;
    private tracker: UnderarmThrowTracker;
    public calibration: CalibrationTracker | null = null;
    private exerciseAttempts: number = 3;

    constructor() {
        this.activeState = new CalibratingState(this);
        this.tracker = this.initialiseTracker();
    }

    reset(): void {
        this.calibration = null;
        this.tracker = this.initialiseTracker();
        this.activeState = new CalibratingState(this);
    }
    
    setTime(currentTime: number): void {
        // Not explicitly needed for this architecture as processFrame passes timestamp
    }
    
    configure(settings?: any): void {
        if (settings?.throwingArm === 'left' || settings?.throwingArm === 'right') {
            this.tracker.throwing_arm = settings.throwingArm;
        }
    }
    
    calibrate(landmarksData: LandmarksData, frameThreshold?: number): CalibrationTracker {
        this.runCalibrationLogic(landmarksData, frameThreshold);
        return this.calibration!;
    }
    
    isCalibrationValid(): boolean {
        return this.calibration !== null && this.calibration.curr_state > 0;
    }
    
    analyse(landmarksData: LandmarksData, frameIndex?: number): UnderarmThrowTracker {
        this.runAnalysisLogic(landmarksData, 0);
        return this.tracker;
    }
    
    populateCalibrationProgress(progressElement: HTMLElement): void {
        // Obsolete in new architecture
    }
    
    populateMetrics(metricsElement: HTMLElement): void {
        // Obsolete in new architecture
    }
    
    populateMovementProgress(attempt: number, progressElement: HTMLElement): void {
        // Obsolete in new architecture
    }

    private initialiseTracker(): UnderarmThrowTracker {
        return {
            throwing_arm: 'right', // Hardcoded default
            isInFront: false,
            isBehind: false,
            prev_wrist_position: null,
            velocity_buffer: [],
            velocity_buffer_size: 5,
            direction_state: 'neutral',
            direction_confidence: 0,
            backward_swing_peak: null,
            forward_swing_peak: null,
            total_swing_angle: 0,
            is_underarm: true,
            throw_valid: true,
            validation_messages: [],
            armspan: 0,
            start_time: null,
            end_time: null,
            duration: 0,
            attempt_finished: false,
            landmark_series: []
        };
    }
    
    private initialiseCalibrationTracker(): void {
        this.calibration = {
            curr_state: 0,
            total_states: 2,
            visibility: [],
            standing_straight: [],
            armspan: [],
            avg_armspan: 0
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
        if (this.calibration!.curr_state === 2) return;

        const isVisible = checkAllVisible(landmarksData, 0);
        updateHistory(this.calibration!.visibility, isVisible, frameThreshold);

        const stance = checkStance(landmarksData, 0);
        updateHistory(this.calibration!.standing_straight, stance.isCorrect, frameThreshold);
        updateHistory(this.calibration!.armspan, stance.armspan, frameThreshold);

        this.processCalibrationState(frameThreshold);
    }
    
    private processCalibrationState(frameThreshold: number): void {
        if (!this.calibration) return;

        const allVisible = this.calibration.visibility.length >= frameThreshold && 
            this.calibration.visibility.slice(-frameThreshold).every(v => v);
        const allInvisible = this.calibration.visibility.length >= frameThreshold && 
            this.calibration.visibility.slice(-frameThreshold).every(v => !v);

        const correctStance = this.calibration.standing_straight.length >= frameThreshold && 
            this.calibration.standing_straight.slice(-frameThreshold).every(v => v);
        const incorrectStance = this.calibration.standing_straight.length >= frameThreshold && 
            this.calibration.standing_straight.slice(-frameThreshold).every(v => !v);

        const avgArmspan = this.calibration.armspan.reduce((sum, val) => sum + val, 0) / Math.max(1, this.calibration.armspan.length);

        if (this.calibration.curr_state === 0 && allVisible) {
            this.calibration.curr_state = 1;
        } else if (this.calibration.curr_state !== 0 && allInvisible) {
            this.calibration.curr_state = 0;
        } else if (this.calibration.curr_state === 1 && correctStance) {
            this.calibration.curr_state = 2;
            this.calibration.avg_armspan = avgArmspan;
        } else if (this.calibration.curr_state === 2 && incorrectStance) {
            this.calibration.curr_state = 1;
        }
    }

    public runAnalysisLogic(landmarksData: LandmarksData, timestampMs: number): void {
        const frameIndex = 0;
        if (!landmarksData || !landmarksData.landmarks || !landmarksData.landmarks[frameIndex]) {
            return;
        }
        
        const timestampS = timestampMs / 1000;

        if (this.tracker.armspan === 0 && this.calibration) {
            this.tracker.armspan = this.calibration.avg_armspan;
        }

        if (!this.tracker.attempt_finished) {
            this.tracker.landmark_series.push(landmarksData); // Simplified storage
        }

        const validationResult = this.validateLiveTechnique(landmarksData, frameIndex);
        this.tracker.is_underarm = validationResult.isValid;
        this.tracker.throw_valid = validationResult.isValid;
        this.tracker.validation_messages = validationResult.messages;

        if (!this.tracker.attempt_finished) {
            this.trackSwingMotion(landmarksData, frameIndex, timestampS);

            if (this.tracker.total_swing_angle > 100) {
                this.tracker.attempt_finished = true;
                if (this.tracker.start_time !== null) {
                    this.tracker.end_time = timestampS;
                    this.tracker.duration = Math.round((this.tracker.end_time - this.tracker.start_time) * 100000) / 100;
                }
            }
        }
    }
    
    private validateLiveTechnique(landmarksData: LandmarksData, frameIndex: number): { isValid: boolean, messages: string[] } {
        const throwingArm = this.tracker.throwing_arm;
        const messages: string[] = [];

        const wristId = throwingArm === 'left' ? LANDMARKS.left_wrist : LANDMARKS.right_wrist;
        const elbowId = throwingArm === 'left' ? LANDMARKS.left_elbow : LANDMARKS.right_elbow;
        const shoulderId = throwingArm === 'left' ? LANDMARKS.left_shoulder : LANDMARKS.right_shoulder;

        const wrist = getLandmark(landmarksData, frameIndex, wristId);
        const elbow = getLandmark(landmarksData, frameIndex, elbowId);
        const shoulder = getLandmark(landmarksData, frameIndex, shoulderId);

        const elbowNotAboveShoulder = elbow.y >= shoulder.y;
        if (!elbowNotAboveShoulder) {
            messages.push("Elbow is above shoulder - not underarm technique");
        }

        const elbowAngle = jointAngle(
            [shoulder.x, shoulder.y, shoulder.z],
            [elbow.x, elbow.y, elbow.z],
            [wrist.x, wrist.y, wrist.z]
        );

        const elbowExtended = elbowAngle > 140;
        if (!elbowExtended) {
            messages.push(`Elbow too bent (${elbowAngle.toFixed(1)}° < 140°)`);
        }

        return {
            isValid: elbowNotAboveShoulder && elbowExtended,
            messages
        };
    }

    private updateWristPosition(wrist: Landmark, hip: Landmark, shoulder: Landmark) {
        let isBehind, isInFront;
        if (this.tracker.throwing_arm === 'left') {
            isBehind = wrist.x > shoulder.x && wrist.x > hip.x;
            isInFront = wrist.x < shoulder.x && wrist.x < hip.x;
        } else {
            isBehind = wrist.x < shoulder.x && wrist.x < hip.x;
            isInFront = wrist.x > shoulder.x && wrist.x > hip.x;
        }
        
        this.tracker.isBehind = isBehind;
        this.tracker.isInFront = isInFront;
    }
    
    private updateSwingDirection(wrist: Landmark, timestampS: number) {
        if (!this.tracker.prev_wrist_position) return;
        
        const velocityX = wrist.x - this.tracker.prev_wrist_position.x;
        this.tracker.velocity_buffer.push(velocityX);

        if (this.tracker.velocity_buffer.length > this.tracker.velocity_buffer_size) {
            this.tracker.velocity_buffer.shift();
        }

        const smoothedVelocityX = this.tracker.velocity_buffer.reduce((sum, v) => sum + v, 0) / Math.max(1, this.tracker.velocity_buffer.length);

        let detectedDirection: 'neutral' | 'forward' | 'backward' = 'neutral';
        const threshold = 0.005;

        if (this.tracker.throwing_arm === 'right') {
            if (smoothedVelocityX > threshold) detectedDirection = 'forward';
            else if (smoothedVelocityX < -threshold) detectedDirection = 'backward';
        } else {
            if (smoothedVelocityX < -threshold) detectedDirection = 'forward';
            else if (smoothedVelocityX > threshold) detectedDirection = 'backward';
        }

        if (detectedDirection === this.tracker.direction_state) {
            this.tracker.direction_confidence++;
        } else if (detectedDirection !== 'neutral') {
            if (this.tracker.direction_confidence > 0) {
                this.tracker.direction_confidence--;
            } else {
                this.tracker.direction_state = detectedDirection;
                this.tracker.direction_confidence = 1;

                if (detectedDirection === 'backward') {
                    this.tracker.start_time = timestampS;
                    if (this.tracker.isBehind) {
                        this.tracker.forward_swing_peak = null;
                        this.tracker.backward_swing_peak = null;
                    }
                }
            }
        }

        this.tracker.direction_confidence = Math.min(this.tracker.direction_confidence, 10);
    }
    
    private trackSwingMotion(landmarksData: LandmarksData, frameIndex: number, timestampS: number) {
        const throwingArm = this.tracker.throwing_arm;

        const wristId = throwingArm === 'left' ? LANDMARKS.left_wrist : LANDMARKS.right_wrist;
        const elbowId = throwingArm === 'left' ? LANDMARKS.left_elbow : LANDMARKS.right_elbow;
        const shoulderId = throwingArm === 'left' ? LANDMARKS.left_shoulder : LANDMARKS.right_shoulder;
        const hipId = throwingArm === 'left' ? LANDMARKS.left_hip : LANDMARKS.right_hip;

        const wrist = getLandmark(landmarksData, frameIndex, wristId);
        const shoulder = getLandmark(landmarksData, frameIndex, shoulderId);
        const hip = getLandmark(landmarksData, frameIndex, hipId);

        this.updateWristPosition(wrist, hip, shoulder);

        if (this.tracker.prev_wrist_position) {
            this.updateSwingDirection(wrist, timestampS);
        }
        
        this.tracker.prev_wrist_position = { x: wrist.x, y: wrist.y, z: wrist.z };

        if (this.tracker.direction_state === 'backward' && this.tracker.isBehind) {
            if (!this.tracker.backward_swing_peak || wrist.y < this.tracker.backward_swing_peak.y) {
                this.tracker.backward_swing_peak = { x: wrist.x, y: wrist.y, z: wrist.z };
            }
        }

        if (this.tracker.direction_state === 'forward') {
            if (!this.tracker.forward_swing_peak || wrist.y < this.tracker.forward_swing_peak.y) {
                this.tracker.forward_swing_peak = { x: wrist.x, y: wrist.y, z: wrist.z };
            }
        }

        if (this.tracker.backward_swing_peak && this.tracker.forward_swing_peak) {
            const backwardVector = vector(this.tracker.backward_swing_peak, shoulder);
            const forwardVector = vector(this.tracker.forward_swing_peak, shoulder);
            this.tracker.total_swing_angle = getVectorAngle(backwardVector, forwardVector);
        }
    }

    public isPoseValid(): boolean {
        return this.tracker.throw_valid && this.tracker.is_underarm;
    }

    public calibrationFinished(): boolean {
        return this.calibration?.curr_state === 2;
    }

    public movementFinished(attempts: UnderarmThrowTracker[]): boolean {
        return attempts.length >= this.exerciseAttempts;
    }

    public getCalibrationUIState(): CalibrationUIState {
        if (!this.calibration) return { progress: 0, message: "Awaiting detection...", isComplete: false };
        let msg = "Follow instructions";
        switch(this.calibration.curr_state) {
            case 0: msg = "Ensure all body parts are visible to the camera."; break;
            case 1: msg = "Stand up straight and hold both hands by your side."; break;
            case 2: msg = "Calibration Complete, please proceed with the underarm throw exercise."; break;
        }
        return {
            progress: (this.calibration.curr_state / 2) * 100,
            message: msg,
            isComplete: this.calibration.curr_state === 2
        };
    }
    
    public getTrackerState(): UnderarmThrowTracker {
        return this.tracker;
    }
}