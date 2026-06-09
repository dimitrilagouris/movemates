import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiArrowRightLine, RiFilmLine } from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import { DatabaseEngine } from '../../../engine/db';
import { Button } from '../../../components/common/Button';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import './style.css';

/**
 * Handles fetching the stored video file from IndexedDB and managing its local URL lifetime.
 */
const ReplayPlayer = () => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let activeUrl: string | null = null;

        const loadStoredVideo = async (): Promise<void> => {
            const db = new DatabaseEngine();
            const videoBlob = await db.getRecordingBlob('lastRecording');

            if (videoBlob) {
                activeUrl = URL.createObjectURL(videoBlob);
                setVideoUrl(activeUrl);
            }
            setIsLoading(false);
        };

        loadStoredVideo();

        return () => {
            if (activeUrl) URL.revokeObjectURL(activeUrl);
        };
    }, []);

    if (isLoading) {
        return <div className="replay-status">Loading session recording...</div>;
    }

    if (!videoUrl) {
        return (
            <div className="video-content">
                <div className="video-icon-circle video-icon-circle--faint">
                    <RiFilmLine size={32} />
                </div>
                <p>No session recording found. Please complete a recording session first.</p>
            </div>
        );
    }

    return (
        <video
            src={videoUrl}
            className="replay-video-element"
            controls
            autoPlay
            playsInline
        />
    );
};

const SessionSummaryCard = () => (
    <div className="sidebar-card shadow-1">
        <div className="sidebar-card__header">
            <span className="sidebar-card__title">Session Captured</span>
        </div>
        <div className="sidebar-list">
            <div className="sidebar-row">
                <div className="row-header">
                    <span className="row-dot dot--green"></span>
                    <span className="row-label">VIDEO CAPTURE</span>
                </div>
                <div className="row-content">
                    Your session was saved locally. Review your stance using the player before generating your metric assessment report.
                </div>
            </div>
        </div>
    </div>
);

export const ReplayPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();
    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;

    if (!movement) return <div>Movement not found</div>;

    return (
        <div className="learn-page">
            <div className="learn-page__nav">
                <Breadcrumbs items={[
                    { label: movement.title, path: `/movements/learn/${movementId}` },
                    { label: 'Record', path: `/movements/record/${movementId}` },
                    { label: 'Replay' }
                ]} />
            </div>

            <header className="learn-page__header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">Review Session: {movement.title}</h1>
                </div>
                <div className="learn-page__header-right">
                    <Button
                        variant="primary"
                        className="shadow-1"
                        onClick={() => navigate(`/movements/report/${movementId}`)}
                    >
                        Generate Assessment Report <RiArrowRightLine />
                    </Button>
                </div>
            </header>

            <main className="learn-page__content">
                <div className="video-container flex items-center justify-center bg-zinc-950 rounded-xl overflow-hidden relative flex-1">
                    <ReplayPlayer />
                </div>

                <aside className="learn-sidebar shadow-1">
                    <SessionSummaryCard />
                </aside>
            </main>
        </div>
    );
};