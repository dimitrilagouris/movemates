import type { ReportExportStrategy } from './ReportExportStrategy';
import type { UnderarmThrowTracker } from '../movements/UnderarmThrowAnalyser';
import { 
    getSagittalAngle, 
    getCoronalAngle, 
    getTransverseAngle, 
    getKneeFlexion, 
    calculateVelocity 
} from '../math/geometry';

export class UnderarmThrowExportStrategy implements ReportExportStrategy {
    
    public static generateChartData(tracker: UnderarmThrowTracker) {
        if (!tracker.landmark_series || tracker.landmark_series.length === 0) return [];
        
        // Account for type hack: landmark_series stores { landmarks: LandmarksData, timestamp: number }
        // We also handle the old format where landmark_series stored LandmarksData directly
        const series = tracker.landmark_series as any[];
        
        // Determine format based on first frame
        const isOldFormat = Array.isArray(series[0].landmarks);
        const startTime = isOldFormat ? (tracker.start_time || 0) : series[0].timestamp;

        let prevTime = startTime;
        let prevRKneeFlexion = 0;
        let prevLKneeFlexion = 0;
        let prevTrunkRotation = 0;

        return series.map((frame, index) => {
            const lmsData = isOldFormat ? frame : frame.landmarks;
            const currentTimestamp = isOldFormat ? startTime + index * (1/30) : frame.timestamp;
            
            const lms = lmsData.landmarks?.[0];
            if (!lms) return null;

            const lShoulder = lms[11], rShoulder = lms[12];
            const lElbow = lms[13], rElbow = lms[14];
            const lHip = lms[23], rHip = lms[24];
            const lKnee = lms[25], rKnee = lms[26];
            const lAnkle = lms[27], rAnkle = lms[28];

            if (!lShoulder || !rShoulder || !lElbow || !rElbow || !lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) return null;

            const dt = index === 0 ? 0 : currentTimestamp - prevTime;
            
            // Shoulder Kinematics
            const lShoulderFlexion = getSagittalAngle(lShoulder, lElbow, lHip);
            const rShoulderFlexion = getSagittalAngle(rShoulder, rElbow, rHip);
            const lShoulderAbd = getCoronalAngle(lShoulder, lElbow, lHip);
            const rShoulderAbd = getCoronalAngle(rShoulder, rElbow, rHip);

            // Rotations
            const hipRotation = getTransverseAngle(lHip, rHip);
            const trunkRotation = getTransverseAngle(lShoulder, rShoulder);

            // Knees
            const lKneeFlexion = getKneeFlexion(lHip, lKnee, lAnkle);
            const rKneeFlexion = getKneeFlexion(rHip, rKnee, rAnkle);

            // Velocities
            const lKneeVel = calculateVelocity(lKneeFlexion, prevLKneeFlexion, dt);
            const rKneeVel = calculateVelocity(rKneeFlexion, prevRKneeFlexion, dt);
            const trunkRotVel = calculateVelocity(trunkRotation, prevTrunkRotation, dt);

            // Update prev state
            prevTime = currentTimestamp;
            prevLKneeFlexion = lKneeFlexion;
            prevRKneeFlexion = rKneeFlexion;
            prevTrunkRotation = trunkRotation;

            return {
                time: Math.round((currentTimestamp - startTime) * 100) / 100,
                lShoulderFlexion,
                rShoulderFlexion,
                lShoulderAbd,
                rShoulderAbd,
                hipRotation,
                trunkRotation,
                lKneeVel: index === 0 ? 0 : lKneeVel,
                rKneeVel: index === 0 ? 0 : rKneeVel,
                trunkRotVel: index === 0 ? 0 : trunkRotVel,
            };
        }).filter(Boolean) as any[];
    }

    exportToJson(trackerData: any): string {
        const tracker = trackerData as UnderarmThrowTracker;
        const chartData = UnderarmThrowExportStrategy.generateChartData(tracker);
        
        const jsonOutput = {
            movementId: "underarm-throw",
            summary: {
                durationSeconds: tracker.duration,
                throwingArm: tracker.throwing_arm,
                totalSwingAngle: tracker.total_swing_angle,
                isValid: tracker.throw_valid ? "Valid" : "Invalid"
            },
            timeSeriesData: chartData
        };

        return JSON.stringify(jsonOutput, null, 2);
    }
}
