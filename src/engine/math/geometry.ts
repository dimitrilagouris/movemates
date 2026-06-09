import type { Landmark } from '../../types/landmarks';

export function calculate3DAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

    const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
    const magBa = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
    const magBc = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);

    if (magBa === 0 || magBc === 0) return 0;

    // Clamp between -1 and 1 to avoid NaN from floating point inaccuracies
    let cosine = dot / (magBa * magBc);
    cosine = Math.max(-1, Math.min(1, cosine));

    return Math.acos(cosine) * (180 / Math.PI);
}

export function calculate2DAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const ba = { x: a.x - b.x, y: a.y - b.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };

    const dot = ba.x * bc.x + ba.y * bc.y;
    const magBa = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
    const magBc = Math.sqrt(bc.x * bc.x + bc.y * bc.y);

    if (magBa === 0 || magBc === 0) return 0;

    let cosine = dot / (magBa * magBc);
    cosine = Math.max(-1, Math.min(1, cosine));

    return Math.acos(cosine) * (180 / Math.PI);
}

export function getShoulderAbduction(shoulder: Landmark, elbow: Landmark, hip: Landmark): number {
    // Angle between Hip-Shoulder (Torso) and Elbow-Shoulder (Arm)
    // If arms are down by the side, angle is 0.
    const angle = calculate3DAngle(hip, shoulder, elbow);
    return Math.round(angle * 100) / 100;
}

export function getHipAbduction(shoulder: Landmark, hip: Landmark, knee: Landmark): number {
    // Angle between Shoulder-Hip (Torso) and Knee-Hip (Leg)
    // Standing straight = 180. We subtract from 180 so 0 = straight down.
    const angle = calculate3DAngle(shoulder, hip, knee);
    return Math.round(Math.abs(180 - angle) * 100) / 100;
}

export function getKneeValgus(hip: Landmark, knee: Landmark, ankle: Landmark): number {
    // 2D angle between Hip-Knee and Ankle-Knee.
    // 180 means perfectly straight leg. Deviation from 180 is valgus/varus magnitude.
    const angle = calculate2DAngle(hip, knee, ankle);
    return Math.round(Math.abs(180 - angle) * 100) / 100;
}

export function getSagittalAngle(shoulder: Landmark, elbow: Landmark, hip: Landmark): number {
    // Project onto YZ plane
    const vArm = { x: 0, y: elbow.y - shoulder.y, z: elbow.z - shoulder.z };
    const vTrunk = { x: 0, y: hip.y - shoulder.y, z: hip.z - shoulder.z };

    const dot = vArm.y * vTrunk.y + vArm.z * vTrunk.z;
    const magArm = Math.sqrt(vArm.y * vArm.y + vArm.z * vArm.z);
    const magTrunk = Math.sqrt(vTrunk.y * vTrunk.y + vTrunk.z * vTrunk.z);

    if (magArm === 0 || magTrunk === 0) return 0;
    
    let cosine = dot / (magArm * magTrunk);
    cosine = Math.max(-1, Math.min(1, cosine));
    return Math.round(Math.acos(cosine) * (180 / Math.PI) * 100) / 100;
}

export function getCoronalAngle(shoulder: Landmark, elbow: Landmark, hip: Landmark): number {
    // Project onto XY plane
    const vArm = { x: elbow.x - shoulder.x, y: elbow.y - shoulder.y, z: 0 };
    const vTrunk = { x: hip.x - shoulder.x, y: hip.y - shoulder.y, z: 0 };

    const dot = vArm.x * vTrunk.x + vArm.y * vTrunk.y;
    const magArm = Math.sqrt(vArm.x * vArm.x + vArm.y * vArm.y);
    const magTrunk = Math.sqrt(vTrunk.x * vTrunk.x + vTrunk.y * vTrunk.y);

    if (magArm === 0 || magTrunk === 0) return 0;
    
    let cosine = dot / (magArm * magTrunk);
    cosine = Math.max(-1, Math.min(1, cosine));
    return Math.round(Math.acos(cosine) * (180 / Math.PI) * 100) / 100;
}

export function getTransverseAngle(leftLandmark: Landmark, rightLandmark: Landmark): number {
    // XZ plane. E.g. left shoulder to right shoulder.
    const dx = rightLandmark.x - leftLandmark.x;
    const dz = rightLandmark.z - leftLandmark.z;
    
    let angle = Math.atan2(dz, dx) * (180 / Math.PI);
    return Math.round(angle * 100) / 100;
}

export function getKneeFlexion(hip: Landmark, knee: Landmark, ankle: Landmark): number {
    // 3D angle between Hip-Knee and Ankle-Knee.
    const angle = calculate3DAngle(hip, knee, ankle);
    return Math.round(Math.abs(180 - angle) * 100) / 100;
}

export function calculateVelocity(currentVal: number, previousVal: number, dtSeconds: number): number {
    if (dtSeconds <= 0) return 0;
    const velocity = (currentVal - previousVal) / dtSeconds;
    return Math.round(velocity * 100) / 100;
}
