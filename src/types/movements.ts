import type {LandmarksData} from './landmarks';

/** Defines the type of the ID of a movement */
export type MovementId =
    | 'underarm-throw'
    | 'one-legged-stand'
    | 'walking-exercise';

/** Describes a movement object for the UI */
export interface Movement {
    id: MovementId;
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    instructions: string[];
    doGuidelines: string[];
    dontGuidelines: string[];
}

/** Defines the state and metrics tracked during the initial calibration phase. */
export interface CalibrationTracker {
    curr_state: number;
    total_states: number;
    visibility: boolean[];
    standing_straight: boolean[];
    armspan: number[];
    avg_armspan: number;
}

/** The foundational tracking metrics that every movement must record. */
export interface BaseMovementTracker {
    attempt_finished: boolean;
    start_time: number | null;
    end_time: number | null;
    duration: number;
    landmark_series: LandmarksData[];
    armspan: number;
}

/** Specific metrics for the Underarm Throw movement. */
export interface UnderarmThrowTracker extends BaseMovementTracker {
    throwing_arm: 'left' | 'right';
    isInFront: boolean;
    isBehind: boolean;
    prev_wrist_position: { x: number; y: number; z: number } | null;
    velocity_buffer: number[];
    velocity_buffer_size: number;
    direction_state: 'backward' | 'forward' | 'neutral';
    direction_confidence: number;
    backward_swing_peak: { x: number; y: number; z: number } | null;
    forward_swing_peak: { x: number; y: number; z: number } | null;
    total_swing_angle: number;
    is_underarm: boolean;
    throw_valid: boolean;
    validation_messages: string[];
    has_started_forward_swing: boolean;
    has_started_backward_swing: boolean;
    completion_timestamp: number | null;
}