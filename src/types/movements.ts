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