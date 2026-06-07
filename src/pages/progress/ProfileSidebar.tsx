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
            <div className="sidebar-section__header" style={{ padding: 'var(--space-6) var(--space-6) 0 var(--space-6)' }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--colour-zinc-900)' }}>User Detail</h3>
                {onClose && (
                    <button className="icon-btn" onClick={onClose}>
                        <RiCloseLine size={20} />
                    </button>
                )}
            </div>

            <div className="sidebar-section" style={{ padding: 'var(--space-6)' }}>
                {/* Profile Header */}
                <div className="report-profile" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div className="report-profile__avatar" style={{ width: '48px', height: '48px', fontSize: 'var(--text-lg)', backgroundColor: 'var(--colour-zinc-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--colour-zinc-700)', fontWeight: 600 }}>
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="report-profile__info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h4 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--colour-zinc-900)' }}>{userName}</h4>
                        <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono, monospace)', color: 'var(--colour-zinc-500)' }}>Movemates User</span>
                    </div>
                </div>

                {/* Notes Block */}
                <div className="report-notes" style={{ backgroundColor: 'var(--colour-zinc-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-8)' }}>
                    <div className="report-notes__label" style={{ fontSize: '13px', color: 'var(--colour-zinc-500)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Notes:</div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--colour-zinc-900)', lineHeight: 1.5 }}>
                        {notes}
                    </p>
                </div>

                {/* Bottom Metadata List */}
                <div className="report-meta" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="report-meta__row" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center' }}>
                        <span className="report-meta__label" style={{ fontSize: 'var(--text-sm)', color: 'var(--colour-zinc-500)' }}>Physiotherapist</span>
                        <div className="report-meta__value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--colour-zinc-900)', fontWeight: 500 }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--colour-zinc-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                {physio.charAt(0).toUpperCase()}
                            </div>
                            {physio}
                        </div>
                    </div>
                    
                    <div className="report-progress" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--colour-zinc-500)' }}>
                            <span>Progress Overview</span>
                            <span style={{ color: 'var(--colour-zinc-900)', fontWeight: 500 }}>
                                {totalGoals === 0 ? 'No active goals' : `${completedGoals} of ${totalGoals} Goals`}
                            </span>
                        </div>
                        
                        {totalGoals > 0 && (
                            <div style={{ display: 'flex', gap: '4px', width: '100%', height: '14px' }}>
                                {Array.from({ length: totalGoals }).map((_, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        backgroundColor: i < completedGoals ? 'var(--colour-lime-500)' : 'var(--colour-zinc-200)',
                                        borderRadius: '3px',
                                        boxShadow: i < completedGoals ? 'inset 0 -2px 0 rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.05)' : 'inset 0 1px 2px rgba(0,0,0,0.05)'
                                    }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
