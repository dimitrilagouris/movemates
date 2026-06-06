/** Represents a single 3D spatial landmark detected on the body. */
export interface Landmark {
    /** The x-coordinate of the landmark. */
    x: number;
    /** The y-coordinate of the landmark. */
    y: number;
    /** The z-coordinate of the landmark (depth). */
    z: number;
    /** The confidence score of the landmark's visibility (0.0 to 1.0). */
    visibility?: number;
}

/** Wrapper for the payload containing all detected pose landmarks for a given frame. */
export interface LandmarksData {
    /** A 2D array where the first dimension is the pose instance, and the second is the list of landmarks. */
    landmarks: Landmark[][];
}

/** Standard MediaPipe Pose Landmark names mapped to their array indices (0-32). */
export const LANDMARK_NAMES: string[] = [
    'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
    'right_eye_inner', 'right_eye', 'right_eye_outer',
    'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
    'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
    'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
    'left_index', 'right_index', 'left_thumb', 'right_thumb',
    'left_hip', 'right_hip', 'left_knee', 'right_knee',
    'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
    'left_foot_index', 'right_foot_index'
];