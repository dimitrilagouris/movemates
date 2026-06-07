import React from 'react';
import type { SavedReport } from '../../types/progress';
import { Button } from '../../components/common/Button';
import { 
    RiCloseLine, 
    RiMailLine, 
    RiPhoneLine, 
    RiUser3Line 
} from 'react-icons/ri';

interface ProgressSidebarProps {
    report: SavedReport | null;
    userName: string;
    onClose: () => void;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ report, userName, onClose }) => {
    if (!report) {
        return (
            <div className="progress-sidebar progress-sidebar--empty">
                <p>Select a report to view details</p>
            </div>
        );
    }

    return (
        <aside className="progress-sidebar">
            <div className="sidebar-section">
                <div className="sidebar-section__header">
                    <h4>Report Detail</h4>
                    <button className="icon-btn" onClick={onClose}>
                        <RiCloseLine size={20} />
                    </button>
                </div>

                <div className="report-profile">
                    <div className="report-profile__avatar">
                        <RiUser3Line size={24} />
                    </div>
                    <div className="report-profile__info">
                        <h5>{userName}</h5>
                        <span>{report.companyOrContext || report.movementName}</span>
                    </div>
                </div>

                <div className="report-chips">
                    <div className="report-chip">
                        <RiMailLine size={14} /> {userName.split(' ')[0].toLowerCase()}@movemates.app
                    </div>
                    <div className="report-chip">
                        <RiPhoneLine size={14} /> (555) 123-4567
                    </div>
                </div>

                <div className="report-notes">
                    <span className="report-notes__label">Notes:</span>
                    <p>Great attempt on the {report.movementName.toLowerCase()}. Form was stable, but wrist extension could be slightly improved.</p>
                </div>

                <div className="report-actions">
                    <Button variant="secondary" size="small" style={{ flex: 1 }}>View Full</Button>
                    <Button variant="secondary" size="small" style={{ flex: 1 }}>Compare</Button>
                    <Button variant="secondary" size="small" style={{ flex: 1 }}>Delete</Button>
                </div>

                <div className="report-meta">
                    <div className="report-meta__row">
                        <span className="report-meta__label">Analyst</span>
                        <span className="report-meta__value">
                            <RiUser3Line size={14} /> System AI
                        </span>
                    </div>
                    <div className="report-meta__row">
                        <span className="report-meta__label">Status</span>
                        <span className="tag-badge tag-badge--booked">Analyzed</span>
                    </div>
                    <div className="report-meta__row">
                        <span className="report-meta__label">Form Quality</span>
                        <span className="tag-badge tag-badge--light">High</span>
                    </div>
                    <div className="report-meta__row">
                        <span className="report-meta__label">Progression</span>
                        <span className="report-meta__value">
                            <div className="circular-progress"></div> 4 of 6 milestones
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
