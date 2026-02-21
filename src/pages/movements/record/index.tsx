import {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RiArrowLeftLine,
    RiCameraLensLine,
    RiPlayCircleLine,
    RiStopCircleLine,
    RiRestartLine
} from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import './style.css';

/**
 * Renders the video feed placeholder and recording controls.
 */
const RecordingInterface = ({ onStop }: { onStop: () => void }) => {
    // AR engine state would typically be managed here or passed as props
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const handleStart = (): void => setIsRecording(true);
    const handleRestart = (): void => setIsRecording(false);

    const handleStop = (): void => {
        setIsRecording(false);
        onStop();
    };

    return (
        <div className="record-video-section">
            <div className="video-container">
                <div className="video-content">
                    <div className="video-icon-circle video-icon-circle--faint">
                        <RiCameraLensLine size={32} />
                    </div>
                    <p>
                        <strong>{isRecording ? "Recording..." : "Camera Ready"}</strong>
                    </p>
                </div>
            </div>

            <div className="video-controls">
                <button
                    className="btn btn-primary shadow-1"
                    onClick={handleStart}
                    disabled={isRecording}
                >
                    <RiPlayCircleLine /> Start
                </button>
                <button
                    className="btn btn-secondary shadow-1"
                    onClick={handleRestart}
                >
                    <RiRestartLine /> Restart
                </button>
                <button
                    className="btn btn-danger shadow-1"
                    onClick={handleStop}
                    disabled={!isRecording}
                >
                    <RiStopCircleLine /> Stop
                </button>
            </div>
        </div>
    );
};

/**
 * Renders the AR calibration status and progress bar.
 */
const CalibrationCard = ({ progress }: { progress: number }) => (
    <div className="sidebar-card shadow-1">
        <div className="sidebar-card__header">
            <span className="sidebar-card__title">Calibration</span>
        </div>
        <div className="calibration-content">
            <p className="calibration-note">
                Please ensure your entire body is visible to the camera for accurate tracking.
            </p>
            <div className="progress-bar-container">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="calibration-status">
                {progress === 100 ? "Fully Calibrated" : "Calibrating..."}
            </span>
        </div>
    </div>
);

/**
 * Renders the step-by-step instructions for the movement.
 */
const InstructionsCard = ({ instructions }: { instructions: string[] }) => (
    <div className="sidebar-card shadow-1">
        <div className="sidebar-card__header">
            <span className="sidebar-card__title">Instructions</span>
        </div>
        <div className="sidebar-list">
            {instructions.map((step, index) => (
                <div key={index} className="sidebar-row">
                    <div className="row-header">
                        <span className="row-dot dot--orange"></span>
                        <span className="row-label">STEP {index + 1}</span>
                    </div>
                    <div className="row-content">{step}</div>
                </div>
            ))}
        </div>
    </div>
);

/**
 * Main Record Page component managing the layout and navigation.
 */
export const RecordPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();

    // Mock calibration progress for UI demonstration.
    // This should be replaced with actual AR skeletal tracking confidence.
    const [calibrationProgress, setCalibrationProgress] = useState<number>(0);

    useEffect(() => {
        const timer = setTimeout(() => setCalibrationProgress(100), 2000);
        return () => clearTimeout(timer);
    }, []);

    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;

    if (!movement) return <div>Movement not found</div>;

    return (
        <div className="learn-page">
            <div className="learn-page__nav">
                <button
                    onClick={() => navigate(`/movements/learn/${movementId}`)}
                    className="learn-back-btn"
                >
                    <RiArrowLeftLine /> Back
                </button>
            </div>

            <header className="learn-page__header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">{movement.title}</h1>
                </div>
            </header>

            <main className="learn-page__content">
                <RecordingInterface
                    onStop={() => navigate(`/movements/replay/${movementId}/`)}
                />

                <aside className="learn-sidebar shadow-1">
                    <CalibrationCard progress={calibrationProgress} />
                    <InstructionsCard instructions={movement.instructions} />
                </aside>
            </main>
        </div>
    );
};