import React, { useState, useEffect } from 'react';
import { DatabaseEngine, type AppSettings } from '../../engine/db/DatabaseEngine';
import type { ProgressGoal } from '../../types/progress';
import { GoalCard } from './GoalCard';
import { Button } from '../../components/common/Button';
import { ProfileSidebar } from './ProfileSidebar';
import { useNavigate } from 'react-router-dom';
import { RiUploadCloud2Line, RiArrowLeftLine } from 'react-icons/ri';
import './style.css';

export const ProgressPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<AppSettings | null>(null);

    useEffect(() => {
        const db = new DatabaseEngine();
        db.loadSettings().then(data => {
            setSettings(data);
        });
    }, []);

    const handleGoalChange = (updatedGoal: ProgressGoal) => {
        if (!settings) return;
        const newGoals = (settings.customGoals || []).map(g => g.id === updatedGoal.id ? updatedGoal : g);
        
        const newSettings = { ...settings, customGoals: newGoals };
        setSettings(newSettings);

        // Persist to DB
        const db = new DatabaseEngine();
        db.saveSettings(newSettings);
    };

    return (
        <div className="progress-page">
            <div className="progress-layout">
                <main className="progress-main">
                    <div className="learn-page__nav">
                        <Button
                            variant="text"
                            onClick={() => navigate(-1)}
                            className="learn-back-btn"
                        >
                            <RiArrowLeftLine /> Back
                        </Button>
                    </div>

                    <header className="learn-page__header report-header">
                        <div className="learn-page__header-left">
                            <h1 className="learn-title">
                                My Progress
                            </h1>
                        </div>
                    </header>

                    {/* Goals Row */}
                    <div className="progress-goals-grid">
                        {(settings?.customGoals || []).map(goal => (
                            <GoalCard key={goal.id} goal={goal} onChange={handleGoalChange} />
                        ))}
                    </div>

                    {/* Import Report Empty State */}
                    <div className="import-report-empty-state">
                        <div className="empty-state-content">
                            <div className="empty-state-icon">
                                <RiUploadCloud2Line size={48} />
                            </div>
                            <h3>Import a Report</h3>
                            <p>You haven't imported any external reports yet. Import a report to track your full history.</p>
                            <Button variant="primary" className="shadow-1">Import Report</Button>
                        </div>
                    </div>
                </main>

                <ProfileSidebar settings={settings} />
            </div>
        </div>
    );
};
