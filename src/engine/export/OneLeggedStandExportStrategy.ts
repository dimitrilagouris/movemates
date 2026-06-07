import type { ReportExportStrategy } from './ReportExportStrategy';
import type { OneLeggedStandTracker } from '../movements/OneLeggedStandAnalyser';
import { getShoulderAbduction, getHipAbduction, getKneeValgus } from '../math/geometry';

export class OneLeggedStandExportStrategy implements ReportExportStrategy {
    
    public static generateChartData(tracker: OneLeggedStandTracker) {
        if (!tracker.landmark_series || tracker.landmark_series.length === 0) return [];
        
        const startTime = tracker.landmark_series[0].timestamp;

        return tracker.landmark_series.map((frame) => {
            const lms = frame.landmarks.landmarks[0];
            if (!lms) return null;

            const lShoulder = lms[11], rShoulder = lms[12];
            const lElbow = lms[13], rElbow = lms[14];
            const lHip = lms[23], rHip = lms[24];
            const lKnee = lms[25], rKnee = lms[26];
            const lAnkle = lms[27], rAnkle = lms[28];

            if (!lShoulder || !rShoulder || !lElbow || !rElbow || !lHip || !rHip || !lKnee || !rKnee || !lAnkle || !rAnkle) return null;

            return {
                time: Math.round((frame.timestamp - startTime) * 10) / 10,
                lShoulderAbd: getShoulderAbduction(lShoulder, lElbow, lHip),
                rShoulderAbd: getShoulderAbduction(rShoulder, rElbow, rHip),
                lHipAbd: getHipAbduction(lShoulder, lHip, lKnee),
                rHipAbd: getHipAbduction(rShoulder, rHip, rKnee),
                lKneeValgus: getKneeValgus(lHip, lKnee, lAnkle),
                rKneeValgus: getKneeValgus(rHip, rKnee, rAnkle),
            };
        }).filter(Boolean) as any[];
    }

    exportToJson(trackerData: any): string {
        const tracker = trackerData as OneLeggedStandTracker;
        const chartData = OneLeggedStandExportStrategy.generateChartData(tracker);
        
        const jsonOutput = {
            movementId: "one-legged-stand",
            summary: {
                holdDurationSeconds: tracker.duration,
                legUsed: tracker.lifted_leg === 'left' ? "Left" : (tracker.lifted_leg === 'right' ? "Right" : "N/A"),
                supportingLeg: tracker.supporting_leg || "N/A",
                formAccuracy: !tracker.legs_crossed ? "Correct" : "Incorrect",
                armspanMeters: tracker.armspan > 0 ? tracker.armspan : "N/A"
            },
            timeSeriesData: {
                shoulderAbduction: chartData.map(d => ({ time: d.time, left: d.lShoulderAbd, right: d.rShoulderAbd })),
                hipAbduction: chartData.map(d => ({ time: d.time, left: d.lHipAbd, right: d.rHipAbd })),
                kneeValgus: chartData.map(d => ({ time: d.time, left: d.lKneeValgus, right: d.rKneeValgus }))
            }
        };

        return JSON.stringify(jsonOutput, null, 2);
    }
}
