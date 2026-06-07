import type { MovementId } from '../../types/movements';
import type { ReportExportStrategy } from './ReportExportStrategy';
import { OneLeggedStandExportStrategy } from './OneLeggedStandExportStrategy';

export class ReportExporter {
    private strategies: Partial<Record<MovementId, ReportExportStrategy>> = {
        'one-legged-stand': new OneLeggedStandExportStrategy()
    };

    /**
     * Exports the tracker data using the appropriate strategy and triggers a file download.
     * @param movementId The ID of the movement (e.g. 'one-legged-stand')
     * @param trackerData The movement's raw tracker data
     */
    public export(movementId: MovementId, trackerData: any): void {
        const strategy = this.strategies[movementId];
        let jsonStr: string;

        if (!strategy) {
            console.warn(`No export strategy found for movement: ${movementId}. Falling back to generic export.`);
            jsonStr = JSON.stringify(trackerData, null, 2);
        } else {
            jsonStr = strategy.exportToJson(trackerData);
        }

        this.downloadJson(`${movementId}-report.json`, jsonStr);
    }

    private downloadJson(filename: string, content: string) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
