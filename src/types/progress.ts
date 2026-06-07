export interface ProgressGoal {
    id: number;
    text: string;
    completed: boolean;
    dateAdded: string;
}

export type ReportStatus = 'Positive' | 'Neutral' | 'Negative';

export interface SavedReport {
    id: string;
    userName: string;
    movementName: string;
    companyOrContext?: string;
    status: ReportStatus;
    referenceId?: string;
    timestampLabel: string;
    tagLabel?: string;
    tagState?: 'default' | 'booked' | 'awaiting';
}
