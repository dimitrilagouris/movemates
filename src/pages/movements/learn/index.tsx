import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RiArrowLeftLine,
    RiPlayFill,
    RiUploadCloud2Line,
    RiCheckLine,
    RiRunLine
} from "react-icons/ri";
import { DatabaseEngine } from '../../../engine/db';
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import { Button } from '../../../components/common/Button';
import { Breadcrumbs } from '../../../components/common/Breadcrumbs';
import { UploadEmptyState } from '../../../components/common/UploadEmptyState';
import './style.css';

/**
 * Handles file selection, IndexedDB storage, and video preview rendering.
 */
const VideoUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const db = new DatabaseEngine();
            await db.saveRecordingBlob(file);

            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            onUploadSuccess();
        } catch (error) {
            console.error("Failed to save video to database:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Cleanup memory when component unmounts
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (previewUrl) {
        return (
            <div className="video-content w-full h-full">
                <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain bg-black rounded-xl"
                />
                <button
                    className="btn btn-secondary mt-4 shadow-1"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Upload Different Video
                </button>
                <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>
        );
    }

    return (
        <>
            <UploadEmptyState
                title="Upload your attempt"
                description="Upload a video of your movement for AI analysis."
                buttonText="Select Video"
                isLoading={isUploading}
                onClick={() => fileInputRef.current?.click()}
            />
            <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
            />
        </>
    );
};

export const LearnPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'demo' | 'upload'>('demo');
    const [hasUploadedVideo, setHasUploadedVideo] = useState<boolean>(false);

    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const movement: Movement | null = movementId ? MOVEMENTS[movementId] : null;

    useEffect(() => {
        const updateIndicator = () => {
            const activeIndex = viewMode === 'demo' ? 0 : 1;
            const currentTab = tabsRef.current[activeIndex];

            if (currentTab) {
                setIndicatorStyle({
                    left: currentTab.offsetLeft,
                    width: currentTab.offsetWidth
                });
            }
        };

        updateIndicator();
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [viewMode]);

    if (!movement) return <div>Movement not found</div>;

    const handlePrimaryAction = (): void => {
        if (viewMode === 'upload' && hasUploadedVideo) {
            // Skips recording and goes straight to analysis of the uploaded video
            navigate(`/movements/replay/${movementId}`);
        } else {
            // Navigates to camera recording page
            navigate(`/movements/record/${movementId}`);
        }
    };

    return (
        <div className="learn-page">
            <div className="learn-page__nav">
                <Breadcrumbs items={[{ label: movement.title }]} />
            </div>

            <header className="learn-page__header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">{movement.title}</h1>

                    <div className="nav-tabs">
                        <div
                            className="nav-tabs-indicator animate shadow-1"
                            style={{
                                left: `${indicatorStyle.left}px`,
                                width: `${indicatorStyle.width}px`
                            }}
                        />
                        <button
                            ref={el => { tabsRef.current[0] = el }}
                            className={`nav-tab ${viewMode === 'demo' ? 'active' : ''}`}
                            onClick={() => setViewMode('demo')}
                        >
                            Watch Demo
                        </button>
                        <button
                            ref={el => { tabsRef.current[1] = el }}
                            className={`nav-tab ${viewMode === 'upload' ? 'active' : ''}`}
                            onClick={() => setViewMode('upload')}
                        >
                            Upload Video
                        </button>
                    </div>
                </div>

                <div className="learn-page__header-right">
                    <button
                        className="btn btn-primary shadow-1"
                        onClick={handlePrimaryAction}
                    >
                        {(viewMode === 'upload' && hasUploadedVideo)
                            ? <><RiCheckLine /> Analyse Upload</>
                            : "Start Session"}
                    </button>
                </div>
            </header>

            <main className="learn-page__content">
                <div className="video-container">
                    {viewMode === 'demo' ? (
                        <div className="video-content">
                            <div className="video-icon-circle">
                                <RiPlayFill size={32} />
                            </div>
                            <p><strong>Demonstration</strong> • {movement.title}</p>
                        </div>
                    ) : (
                        <VideoUploader onUploadSuccess={() => setHasUploadedVideo(true)} />
                    )}
                </div>

                <aside className="learn-sidebar">
                    <div className="sidebar-card shadow-1">
                        <div className="sidebar-card__header">
                            <span className="sidebar-card__title">Instructions</span>
                        </div>
                        <div className="sidebar-list">
                            {movement.instructions.map((step, index) => (
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

                    <div className="sidebar-card shadow-1">
                        <div className="sidebar-card__header">
                            <span className="sidebar-card__title">Guidelines</span>
                        </div>
                        <div className="sidebar-list">
                            {movement.doGuidelines.map((item, index) => (
                                <div key={`do-${index}`} className="sidebar-row">
                                    <div className="row-header">
                                        <span className="row-dot dot--green"></span>
                                        <span className="row-label">DO</span>
                                    </div>
                                    <div className="row-content">{item}</div>
                                </div>
                            ))}

                            {movement.dontGuidelines.map((item, index) => (
                                <div key={`dont-${index}`} className="sidebar-row">
                                    <div className="row-header">
                                        <span className="row-dot dot--red"></span>
                                        <span className="row-label">DON'T</span>
                                    </div>
                                    <div className="row-content">{item}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};