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