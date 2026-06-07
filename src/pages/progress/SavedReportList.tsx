import React from 'react';
import type { SavedReport } from '../../types/progress';
import { 
    RiArrowRightUpLine, 
    RiBuilding4Line, 
    RiFlashlightLine, 
    RiCheckLine, 
    RiSubtractLine, 
    RiCloseLine 
} from 'react-icons/ri';

interface SavedReportListProps {
    reports: SavedReport[];
    onSelectReport: (report: SavedReport) => void;
}

export const SavedReportList: React.FC<SavedReportListProps> = ({ reports, onSelectReport }) => {
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Positive': return <RiCheckLine size={14} className="status-icon positive" />;
            case 'Negative': return <RiCloseLine size={14} className="status-icon negative" />;
            default: return <RiSubtractLine size={14} className="status-icon neutral" />;
        }
    };

    return (
        <div className="report-list-container">
            <div className="report-list-header">
                <h3 className="report-list-title">Saved Reports</h3>
            </div>

            <div className="report-list">
                {reports.map((report) => (
                    <div 
                        key={report.id} 
                        className="report-row" 
                        onClick={() => onSelectReport(report)}
                    >
                        <div className="report-row__left">
                            <div className="report-row__title">{report.userName}</div>
                            {report.companyOrContext && (
                                <div className="report-row__subtitle">
                                    <RiBuilding4Line size={12} /> {report.companyOrContext}
                                </div>
                            )}
                            <div className="report-row__subtitle">
                                <RiFlashlightLine size={12} /> {report.movementName}
                            </div>
                        </div>

                        <div className="report-row__right">
                            <div className="report-row__meta-top">
                                <span className="report-row__status">
                                    {getStatusIcon(report.status)} {report.status}
                                </span>
                                <span className="report-row__dot">•</span>
                                {report.referenceId && (
                                    <>
                                        <span className="report-row__ref">
                                            {report.referenceId} <RiArrowRightUpLine size={12} />
                                        </span>
                                        <span className="report-row__dot">•</span>
                                    </>
                                )}
                                <span className="report-row__time">{report.timestampLabel}</span>
                            </div>
                            <div className="report-row__tags">
                                {report.tagLabel && <span className="tag-badge tag-badge--light">{report.tagLabel}</span>}
                                {report.tagState && <span className={`tag-badge tag-badge--${report.tagState}`}>{report.tagState}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
