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
import { DatabaseEngine } from '../../../engine/db';
import './style.css';
import {Button} from "../../../components/common/Button.tsx";

/**
 * Manages the native MediaRecorder API to capture, encode, and store video.
 */
const useVideoRecorder = (
    videoRef: RefObject<HTMLVideoElement>,
    setIsRecording: (isRec: boolean) => void,
    onSaved: () => void
) => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const start = (): void => {
        const stream = videoRef.current?.srcObject as MediaStream | undefined;
        if (!stream) return;

        chunksRef.current = [];

        // Attempt to capture high quality webm
        const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? { mimeType: 'video/webm;codecs=vp9' }
            : { mimeType: 'video/webm' };

        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) chunksRef.current.push(event.data);
        };

        recorder.onstop = async () => {
            if (chunksRef.current.length > 0) {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const db = new DatabaseEngine();
                // Overwrites the previous recording naturally by reusing 'lastRecording'
                await db.saveRecordingBlob(blob, 'lastRecording');
                onSaved();
            }
        };

        recorder.start();
        setIsRecording(true);
    };

    const stop = (): void => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop(); // Triggers onstop, saving the DB file and navigating
            setIsRecording(false);
        }
    };

    const restart = (): void => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.onstop = null; // Disconnect listener so it doesn't save to DB
            mediaRecorderRef.current.stop();
        }
        chunksRef.current = [];
        setIsRecording(false);
    };

    // Cleanup hanging recordings if user navigates away unexpectedly
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.onstop = null;
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return { start, stop, restart };
};

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

    useEffect(() => {
        if (movementId) {
            try { analyserRef.current = getAnalyserInstance(movementId); }
            catch { setMessage("Calibration not supported for this movement."); }
        }
    }, [movementId]);

    useEffect(() => {
        if (analyserRef.current) {
            analyserRef.current.setRecordingState(isRecording);
        }
    }, [isRecording]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!movementId || !video || !canvas) return;

        const detector = detectorRef.current;
        const ctx = canvas.getContext('2d');

        // Declared in the outer closure so the cleanup function can cancel it
        let callbackId = 0;
        let isActive = true;

        const processFrame = (_now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata): void => {
            const analyser = analyserRef.current;

            if (detector.isReady() && ctx && analyser) {
                if (canvas.width !== video.videoWidth) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // mediaTime is the frame's actual capture timestamp in seconds
                const timestamp = metadata.mediaTime * 1000;
                const landmarksData = detector.detect(video, timestamp);

                if (landmarksData?.landmarks[0]) {
                    analyser.processFrame(landmarksData, timestamp);

                    const uiState = analyser.getCalibrationUIState();
                    setProgress(uiState.progress);
                    setMessage(uiState.message);

                    const colour = analyser.getOverlayColour();
                    drawSkeletonConnections(ctx, landmarksData.landmarks[0], colour);
                    drawJointPoints(ctx, landmarksData.landmarks[0], colour);
                }
            }

            callbackId = video.requestVideoFrameCallback(processFrame);
        };

        const startEngine = async (): Promise<void> => {
            await detector.initialise();
            if (!isActive) return;
            callbackId = video.requestVideoFrameCallback(processFrame);
        };

        startEngine();

        return () => {
            isActive = false;
            video.cancelVideoFrameCallback(callbackId);
            detector.close();
        };
    }, [movementId, videoRef, canvasRef]);

    return { progress, message, analyserRef };
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

const CalibrationCard = ({ progress, message }: { progress: number, message: string }): JSX.Element => (
    <div className="sidebar-card shadow-1">
        <div className="sidebar-card__header">
            <span className="sidebar-card__title">Calibration</span>
        </div>
        <div className="calibration-content">
            <p className="calibration-note">{message}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="calibration-status">
                {progress === 100 ? "Fully Calibrated" : "Calibrating..."}
            </span>
        </div>
    </div>
);

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

export const RecordPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isRecording, setIsRecording] = useState<boolean>(false);

    const { progress, message, analyserRef } = useMovementSession(movementId, videoRef, canvasRef, isRecording);

    // Initialise recorder and wire the stop event to trigger navigation
    const handleSavedAndNavigate = () => {
        if (analyserRef.current) {
            const trackerState = analyserRef.current.getTrackerState();
            const db = new DatabaseEngine();
            db.saveAttemptsData('lastRecording_attempts', [trackerState]).then(() => {
                navigate(`/movements/replay/${movementId}`);
            });
        } else {
            navigate(`/movements/replay/${movementId}`);
        }
    };
    const { start, stop, restart } = useVideoRecorder(videoRef, setIsRecording, handleSavedAndNavigate);

    // Auto-start recording when calibration completes
    useEffect(() => {
        // We scope this strictly to the one-legged stand as requested
        if (movementId == 'one-legged-stand' && progress == 100 && !isRecording) {
            start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress, movementId, isRecording]);

    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;
    if (!movement) return <div>Movement not found</div>;

    return (
        <div className="learn-page">
            <div className="learn-page__nav">
                <Button
                    variant="text"
                    onClick={() => navigate(`/movements/learn/${movementId}`)}
                    className="learn-back-btn"
                >
                    <RiArrowLeftLine /> Back
                </Button>
            </div>

            <header className="learn-page__header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">{movement.title}</h1>
                </div>
                <div className="learn-page__header-right">
                    <Button
                        variant="primary"
                        className="shadow-1"
                        onClick={() => navigate(`/movements/replay/${movementId}`)}
                    >
                        View Replay
                    </Button>
                </div>
            </header>

            <main className="learn-page__content">
                <RecordingInterface
                    isRecording={isRecording}
                    onStart={start}
                    onRestart={restart}
                    onStop={stop}
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