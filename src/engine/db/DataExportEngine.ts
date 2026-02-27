import { type LandmarkFrame, type Landmark } from './DatabaseEngine';

/**
 * Handles formatting data into CSVs and triggering browser downloads.
 */
export class DataExportEngine {

    /**
     * Converts landmark data to CSV and triggers a download.
     */
    public static downloadLandmarksAsCSV(landmarksData: LandmarkFrame[], landmarkKey: string, filename: string): boolean {
        if (!landmarksData || landmarksData.length === 0) {
            console.warn(`No ${landmarkKey} data available for export`);
            return false;
        }

        try {
            const rows: string[] = ['timestamp,landmark_index,x,y,z,visibility'];

            landmarksData.forEach((frameData) => {
                const timestamp = frameData.videoTime;
                const landmarks = frameData[landmarkKey] as Landmark[][] | undefined;

                if (landmarks && landmarks[0]) {
                    landmarks[0].forEach((landmark, index) => {
                        const x = landmark.x || 0;
                        const y = landmark.y || 0;
                        const z = landmark.z || 0;
                        const visibility = landmark.visibility ?? 1;

                        rows.push(`${timestamp},${index},${x},${y},${z},${visibility}`);
                    });
                }
            });

            this.triggerBrowserDownload(rows.join('\n'), filename);
            return true;
        } catch (error) {
            console.error('Error downloading landmarks as CSV:', error);
            return false;
        }
    }

    private static triggerBrowserDownload(csvContent: string, filename: string): void {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.style.display = 'none';
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}