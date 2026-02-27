/**
 * Represents a single 3D spatial landmark detected on the body.
 * @interface
 */
export interface Landmark {
    x: number;
    y: number;
    z: number;

    /** The confidence score of the landmark's visibility (0.0 to 1.0). */
    visibility?: number;
}

/**
 * Wrapper for the payload containing all detected pose landmarks for a given frame.
 * @interface
 */
export interface LandmarksData {
    /** A 2D array where the first dimension is the pose instance, and the second is the list of landmarks. */
    landmarks: Landmark[][];
}

/**
 * Defines the state and metrics tracked during the initial calibration phase.
 * @interface
 */
export interface CalibrationTracker {
    /** The current state of the calibration process (e.g., 0: waiting, 1: visible, 2: complete). */
    curr_state: number;

    /** The total number of states required to complete calibration. */
    total_states: number;

    /** A rolling history of overall landmark visibility. */
    visibility: boolean[];

    /** A rolling history checking if the user is standing in a neutral, straight pose. */
    is_standing_straight: boolean[];

    /** A rolling history of the user's calculated armspan. */
    armspan: number[];

    /** The finalized average armspan calculated upon successful calibration. */
    avg_armspan: number;
}

/**
 * The foundational tracking metrics that every movement must record.
 * @interface
 */
export interface BaseMovementTracker {
    attempt_finished: boolean;
    start_time: number | null;
    end_time: number | null;
    duration: number;
    landmark_series: LandmarksData[];
    armspan: number;
}