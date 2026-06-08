import React from 'react';
import type { AppSettings } from '../../engine/db/DatabaseEngine';
import { RiCloseLine } from 'react-icons/ri';

interface ProfileSidebarProps {
    settings: AppSettings | null;
    onClose?: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ settings, onClose }) => {
    if (!settings) {
        return (
            <aside className="progress-sidebar progress-sidebar--empty">
                Loading profile...
            </aside>
        );
    }

    // Calculate progress
    const activeGoals = settings.customGoals?.filter(g => g.text.trim() !== '') || [];
    const completedGoals = activeGoals.filter(g => g.completed).length;
    const totalGoals = activeGoals.length;
    
    // Fallbacks
    const userName = settings.userName || 'Mover';
    const physio = settings.physiotherapist || 'Unassigned';
    const notes = settings.notes || 'No notes added.';

    return (
        <aside className="progress-sidebar">
            <div className="sidebar-section__header">
                <h3 className="sidebar-section__title">User Detail</h3>
                {onClose && (
                    <button className="icon-btn" onClick={onClose}>
                        <RiCloseLine size={20} />
                    </button>
                )}
            </div>

            <div className="sidebar-section">
                {/* Profile Header */}
                <div className="report-profile">
                    <div className="report-profile__avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="report-profile__info">
                        <h4 className="report-profile__name">{userName}</h4>
                        <span className="report-profile__role">Movemates User</span>
                    </div>
                </div>

                {/* Notes Block */}
                <div className="report-notes">
                    <div className="report-notes__label">Notes:</div>
                    <p className="report-notes__text">
                        {notes}
                    </p>
                </div>

                {/* Bottom Metadata List */}
                <div className="report-meta">
                    <div className="report-meta__row">
                        <span className="report-meta__label">Physiotherapist</span>
                        <div className="report-meta__value">
                            <div className="report-meta__avatar">
                                {physio.charAt(0).toUpperCase()}
                            </div>
                            {physio}
                        </div>
                    </div>
                    
                    <div className="report-progress">
                        <div className="report-progress__header">
                            <span>Progress Overview</span>
                            <span className="report-progress__count">
                                {totalGoals === 0 ? 'No active goals' : `${completedGoals} of ${totalGoals} Goals`}
                            </span>
                        </div>
                        
                        {totalGoals > 0 && (
                            <div className="report-progress__tracks">
                                {Array.from({ length: totalGoals }).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`report-progress__segment ${i < completedGoals ? 'report-progress__segment--completed' : ''}`} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
