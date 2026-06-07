import type { MovementId } from '../../types/movements';

export interface ReportExportStrategy {
    /**
     * Generates a JSON string representing the report data for a specific movement.
     * @param trackerData The movement-specific tracker data.
     * @returns A JSON formatted string.
     */
    exportToJson(trackerData: any): string;
}
