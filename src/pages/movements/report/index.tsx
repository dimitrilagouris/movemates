import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiFileChartLine, RiAlertLine } from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import { DatabaseEngine } from '../../../engine/db';
import { Button } from '../../../components/common/Button';
import { type OneLeggedStandTracker } from '../../../engine/movements/OneLeggedStandAnalyser';
import './style.css';

export const ReportPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;

    useEffect(() => {
        const fetchAttempts = async () => {
            const db = new DatabaseEngine();
            const data = await db.getAttempts('attemptsData', 'lastRecording_attempts');
            if (data) {
                setAttempts(data);
            }
            setIsLoading(false);
        };
        fetchAttempts();
    }, []);

    if (!movement) return <div>Movement not found</div>;

    if (isLoading) {
        return <div className="report-loading">Generating report...</div>;
    }

    if (!attempts || attempts.length === 0) {
        return (
            <div className="report-error">
                <RiAlertLine size={48} />
                <p>No assessment data found for this session.</p>
                <Button variant="primary" onClick={() => navigate(`/movements/replay/${movementId}`)}>
                    Back to Replay
                </Button>
            </div>
        );
    }

    const latestTracker = attempts[0]; // Assuming only one tracker state is stored per session

    return (
        <div className="learn-page">
            <div className="learn-page__nav">
                <Button
                    variant="text"
                    onClick={() => navigate(`/movements/replay/${movementId}`)}
                    className="learn-back-btn"
                >
                    <RiArrowLeftLine /> Back to Replay
                </Button>
            </div>

            <header className="learn-page__header report-header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">
                        <RiFileChartLine className="mr-2 inline-block" /> 
                        Assessment Report
                    </h1>
                </div>
            </header>

            <main className="report-page">
                {movementId === 'one-legged-stand' && (
                    <OneLeggedStandReport tracker={latestTracker as OneLeggedStandTracker} />
                )}
                
                {movementId !== 'one-legged-stand' && (
                    <div className="report-card">
                        <div className="report-card__title">Generic Report</div>
                        <div className="report-card__detail">Metrics are not configured yet for {movement.title}.</div>
                    </div>
                )}
            </main>
        </div>
    );
};

const OneLeggedStandReport = ({ tracker }: { tracker: OneLeggedStandTracker }) => {
    const isSuccessDuration = tracker.duration > 10;
    const isCorrectForm = !tracker.legs_crossed;

    return (
        <div className="report-content">
            <div className="report-card shadow-1">
                <div className="report-card__title">Hold Duration</div>
                <div className={`report-card__value ${isSuccessDuration ? 'success' : 'error'}`}>
                    {tracker.duration.toFixed(2)}s
                </div>
                <div className="report-card__detail">
                    {isSuccessDuration ? "Great balance! You held it for over 10 seconds." : "Keep practicing to improve your balance time."}
                </div>
            </div>

            <div className="report-card shadow-1">
                <div className="report-card__title">Leg Used</div>
                <div className="report-card__value">
                    {tracker.lifted_leg ? (tracker.lifted_leg === 'left' ? "Left Leg Lifted" : "Right Leg Lifted") : "N/A"}
                </div>
                <div className="report-card__detail">
                    Supporting leg: {tracker.supporting_leg ?? "N/A"}
                </div>
            </div>

            <div className="report-card shadow-1">
                <div className="report-card__title">Form Accuracy</div>
                <div className={`report-card__value ${isCorrectForm ? 'success' : 'error'}`}>
                    {isCorrectForm ? "Correct" : "Incorrect"}
                </div>
                <div className="report-card__detail">
                    {isCorrectForm ? "Legs remained uncrossed during the exercise." : "Legs crossed the midline. Focus on keeping your lifted leg straight."}
                </div>
            </div>

            <div className="report-card shadow-1">
                <div className="report-card__title">Calibrated Armspan</div>
                <div className="report-card__value">
                    {tracker.armspan > 0 ? `${tracker.armspan.toFixed(2)}m` : "N/A"}
                </div>
                <div className="report-card__detail">
                    Measured during the initial stance calibration phase.
                </div>
            </div>
        </div>
    );
};
