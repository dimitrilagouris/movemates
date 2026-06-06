import { type Landmark } from '../db/DatabaseEngine';

// Pairs of landmark indices defining the skeletal links
const POSE_CONNECTIONS: [number, number][] = [
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [11, 23], [12, 24], [23, 24], // Torso
    [23, 25], [25, 27], // Left leg
    [24, 26], [26, 28]  // Right leg
];

/**
 * Draws a line connecting two skeletal joints.
 */
function drawLink(ctx: CanvasRenderingContext2D, from: Landmark, to: Landmark, colour: string): void {
    ctx.beginPath();
    ctx.moveTo(from.x * ctx.canvas.width, from.y * ctx.canvas.height);
    ctx.lineTo(to.x * ctx.canvas.width, to.y * ctx.canvas.height);
    ctx.strokeStyle = colour;
    ctx.lineWidth = 4;
    ctx.stroke();
}

/**
 * Draws all lines linking connected joints across the skeleton.
 */
export function drawSkeletonConnections(ctx: CanvasRenderingContext2D, landmarks: Landmark[], colour: string): void {
    POSE_CONNECTIONS.forEach(([fromIndex, toIndex]) => {
        const fromNode = landmarks[fromIndex];
        const toNode = landmarks[toIndex];

        if (fromNode && toNode && (fromNode.visibility ?? 0) > 0.5 && (toNode.visibility ?? 0) > 0.5) {
            drawLink(ctx, fromNode, toNode, colour);
        }
    });
}

/**
 * Draws circles on individual key joint coordinates.
 */
export function drawJointPoints(ctx: CanvasRenderingContext2D, landmarks: Landmark[], colour: string): void {
    landmarks.forEach((landmark) => {
        if ((landmark.visibility ?? 0) <= 0.5) return;

        ctx.beginPath();
        ctx.arc(landmark.x * ctx.canvas.width, landmark.y * ctx.canvas.height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = colour;
        ctx.fill();
    });
}