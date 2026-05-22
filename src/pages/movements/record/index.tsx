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
import { drawSkeletonConnections, drawJointPoints } from '../../../engine/mediapipe/drawing';
import './style.css';

/**
 * Orchestrates the AR session, delegating logic to the movement's state machine.
 */
const useMovementSession = (
    movementId: MovementId | undefined,
    videoRef: RefObject<HTMLVideoElement>,
    canvasRef: RefObject<HTMLCanvasElement>,
    isRecording: boolean
) => {
    const [progress, setProgress] = useState<number>(0);
    const [message, setMessage] = useState<string>("Loading AR tracking engine...");

    const detectorRef = useRef(new MediaPipeDetector());
    const analyserRef = useRef<MovementAnalyser<any> | null>(null);

    // Initialise the correct analyser for the movement
    useEffect(() => {
        if (movementId) {
            try {
                analyserRef.current = getAnalyserInstance(movementId);
            } catch {
                setMessage("Calibration not supported for this movement.");
            }
        }
    }, [movementId]);

    // Notify the analyser's state machine when recording starts/stops
    useEffect(() => {
        if (analyserRef.current) {
            analyserRef.current.setRecordingState(isRecording);
        }
    }, [isRecording]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!movementId || !video || !canvas) return;

        let animationFrameId: number;
        const detector = detectorRef.current;
        const ctx = canvas.getContext('2d');

        const startEngine = async (): Promise<void> => {
            await detector.initialise();

            const processFrame = (): void => {
                const analyser = analyserRef.current;

                if (video.readyState >= 2 && detector.isReady() && ctx && analyser) {
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const timestamp = performance.now();
                    const landmarksData = detector.detect(video, timestamp);

                    if (landmarksData && landmarksData.landmarks[0]) {
                        // 1. Delegate math to the Analyser's active state
                        analyser.processFrame(landmarksData, timestamp);

                        // 2. Fetch UI state
                        const uiState = analyser.getCalibrationUIState();
                        setProgress(uiState.progress);
                        setMessage(uiState.message);

                        // 3. Delegate colour selection to the active state
                        const activeColour = analyser.getOverlayColour();
                        const activeFrameLandmarks = landmarksData.landmarks[0];

                        drawSkeletonConnections(ctx, activeFrameLandmarks, activeColour);
                        drawJointPoints(ctx, activeFrameLandmarks, activeColour);
                    }
                }
                animationFrameId = requestAnimationFrame(processFrame);
            };

            processFrame();
        };

        startEngine();

        return () => {
            cancelAnimationFrame(animationFrameId);
            detector.close();
        };
    }, [movementId, videoRef, canvasRef]);

    return { progress, message };
};

/**
 * Pure UI component for rendering the video and controls.
 */
const RecordingInterface = ({
                                isRecording,
                                onStart,
                                onRestart,
                                onStop,
                                videoRef,
                                canvasRef
                            }: {
    isRecording: boolean,
    onStart: () => void,
    onRestart: () => void,
    onStop: () => void,
    videoRef: RefObject<HTMLVideoElement>,
    canvasRef: RefObject<HTMLCanvasElement>
}): JSX.Element => {
    return (
        <div className="record-video-section">
            <div className="video-container">
                <VideoPlayer videoRef={videoRef} />
                <canvas ref={canvasRef} className="skeleton-overlay" />
                {isRecording && <div className="recording-indicator shadow-1" />}
            </div>

            <div className="video-controls">
                <button
                    className="btn btn-primary shadow-1"
                    onClick={onStart}
                    disabled={isRecording}
                >
                    <RiPlayCircleLine /> Start
                </button>
                <button
                    className="btn btn-secondary shadow-1"
                    onClick={onRestart}
                >
                    <RiRestartLine /> Restart
                </button>
                <button
                    className="btn btn-danger shadow-1"
                    onClick={onStop}
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // LIFTED STATE: The page now orchestrates the recording mode
    const [isRecording, setIsRecording] = useState<boolean>(false);

    const { progress, message } = useMovementSession(movementId, videoRef, canvasRef, isRecording);
    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;

    if (!movement) return <div>Movement not found</div>;

    const handleStop = () => {
        setIsRecording(false);
        navigate(`/movements/replay/${movementId}`);
    };

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
                    isRecording={isRecording}
                    onStart={() => setIsRecording(true)}
                    onRestart={() => setIsRecording(false)}
                    onStop={handleStop}
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                />

                <aside className="learn-sidebar shadow-1">
                    <CalibrationCard progress={progress} message={message} />
                    <InstructionsCard instructions={movement.instructions} />
                </aside>
            </main>
        </div>
    );
};