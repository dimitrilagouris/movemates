import { useState, useEffect, useRef, type RefObject } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RiArrowLeftLine,
    RiPlayCircleLine,
    RiStopCircleLine,
    RiRestartLine
} from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { MediaPipeDetector } from '../../../engine/mediapipe/detector';
import { getAnalyserInstance } from '../../../engine/factories/MovementAnalyserFactoryRegistry';
import { type MovementAnalyser } from '../../../types/MovementAnalyser';
import './style.css';

/**
 * Connects the live webcam feed to the correct movement analyser.
 * Handles background AR tracking and UI state updates.
 */
const useCalibration = (movementId: MovementId | undefined, videoRef: RefObject<HTMLVideoElement>) => {
    const [progress, setProgress] = useState<number>(0);
    const [message, setMessage] = useState<string>("Loading AR tracking engine...");

    const detectorRef = useRef(new MediaPipeDetector());

    useEffect(() => {
        const video = videoRef.current;
        if (!movementId || !video) return;

        let animationFrameId: number;
        const detector = detectorRef.current;

        // Dynamically load the correct math engine for this movement
        let analyser: MovementAnalyser<any>;
        try {
            analyser = getAnalyserInstance(movementId);
        } catch (error) {
            setMessage("Calibration not supported for this movement.");
            return;
        }

        const startEngine = async (): Promise<void> => {
            await detector.initialise();

            const processFrame = (): void => {
                // Ensure video is playing and MediaPipe is ready
                if (video.readyState >= 2 && detector.isReady()) {

                    const timestamp = performance.now();
                    const landmarksData = detector.detect(video, timestamp);

                    if (landmarksData) {
                        // 1. Run the pure math logic
                        analyser.calibrate(landmarksData);

                        // 2. Fetch the standardised UI state
                        const uiState = analyser.getCalibrationUIState();

                        setProgress(uiState.progress);
                        setMessage(uiState.message);
                    }
                }

                // Loop continuously on monitor refresh
                animationFrameId = requestAnimationFrame(processFrame);
            };

            processFrame();
        };

        startEngine();

        // Teardown AR engine when user leaves the page
        return () => {
            cancelAnimationFrame(animationFrameId);
            detector.close();
        };
    }, [movementId, videoRef]);

    return { progress, message };
};

/**
 * Renders the video feed placeholder and recording controls.
 */
const RecordingInterface = ({ onStop, videoRef }: { onStop: () => void, videoRef: RefObject<HTMLVideoElement> }): JSX.Element => {
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
                <VideoPlayer videoRef={videoRef} />
                {isRecording && <div className="recording-indicator shadow-1" />}
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
const CalibrationCard = ({ progress, message }: { progress: number, message: string }): JSX.Element => (
    <div className="sidebar-card shadow-1">
        <div className="sidebar-card__header">
            <span className="sidebar-card__title">Calibration</span>
        </div>
        <div className="calibration-content">
            <p className="calibration-note">{message}</p>
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
const InstructionsCard = ({ instructions }: { instructions: string[] }): JSX.Element => (
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
 * Main Record Page component managing the layout and AR orchestration.
 */
export const RecordPage = (): JSX.Element => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Abstracted calibration loop handles AR and returns clean state
    const { progress, message } = useCalibration(movementId, videoRef);
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
                <div className="learn-page__header-right">
                    <button
                        className="btn btn-primary shadow-1"
                        onClick={() => navigate(`/movements/replay/${movementId}`)}
                    >
                        View Replay
                    </button>
                </div>
            </header>

            <main className="learn-page__content">
                <RecordingInterface
                    videoRef={videoRef}
                    onStop={() => navigate(`/movements/replay/${movementId}`)}
                />

                <aside className="learn-sidebar shadow-1">
                    <CalibrationCard progress={progress} message={message} />
                    <InstructionsCard instructions={movement.instructions} />
                </aside>
            </main>
        </div>
    );
};