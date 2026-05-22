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
 * Connects the live webcam feed to the correct movement analyser.
 * Handles background AR tracking, skeletal drawing, and UI state updates.
 */
const useCalibration = (
    movementId: MovementId | undefined,
    videoRef: RefObject<HTMLVideoElement>,
    canvasRef: RefObject<HTMLCanvasElement>
) => {
    const [progress, setProgress] = useState<number>(0);
    const [message, setMessage] = useState<string>("Loading AR tracking engine...");

    const detectorRef = useRef(new MediaPipeDetector());

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!movementId || !video || !canvas) return;

        let animationFrameId: number;
        const detector = detectorRef.current;
        const ctx = canvas.getContext('2d');

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
                // Ensure video is playing, MediaPipe is ready, and canvas is accessible
                if (video.readyState >= 2 && detector.isReady() && ctx) {

                    // Match canvas dimensions to video to prevent skeletal offset
                    if (canvas.width !== video.videoWidth) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                    }

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const timestamp = performance.now();
                    const landmarksData = detector.detect(video, timestamp);

                    if (landmarksData && landmarksData.landmarks[0]) {
                        // 1. Run the pure math logic
                        analyser.calibrate(landmarksData);

                        // 2. Fetch the standardised UI state
                        const uiState = analyser.getCalibrationUIState();

                        setProgress(uiState.progress);
                        setMessage(uiState.message);

                        // 3. Render the skeleton overlay (Green if ready, Red if calibrating)
                        const activeColour = uiState.progress === 100 ? "#22c55e" : "#ef4444";
                        const activeFrameLandmarks = landmarksData.landmarks[0];

                        drawSkeletonConnections(ctx, activeFrameLandmarks, activeColour);
                        drawJointPoints(ctx, activeFrameLandmarks, activeColour);
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
    }, [movementId, videoRef, canvasRef]);

    return { progress, message };
};

/**
 * Renders the video feed, skeletal overlay, and recording controls.
 */
const RecordingInterface = ({onStop, videoRef, canvasRef}: {
    onStop: () => void,
    videoRef: RefObject<HTMLVideoElement>,
    canvasRef: RefObject<HTMLCanvasElement>
}): JSX.Element => {
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
                <canvas ref={canvasRef} className="skeleton-overlay" />
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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Abstracted calibration loop handles AR and returns clean state
    const { progress, message } = useCalibration(movementId, videoRef, canvasRef);
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
                    canvasRef={canvasRef}
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