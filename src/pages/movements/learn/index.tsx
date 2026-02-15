import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    RiArrowLeftLine,
    RiPlayFill,
    RiUploadCloud2Line
} from "react-icons/ri";
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId } from '../../../types/movements';
import './style.css';

export const LearnPage = () => {
    const { movementId } = useParams<{ movementId: MovementId }>();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'demo' | 'upload'>('demo');

    // Refs for the sliding indicator logic
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const movement = movementId ? MOVEMENTS[movementId] : null;

    // Recalculate indicator position when viewMode changes or window resizes
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

    return (
        <div className="learn-page">

            {/* ROW 1: Navigation */}
            <div className="learn-page__nav">
                <button onClick={() => navigate('/movements')} className="learn-back-btn">
                    <RiArrowLeftLine /> Back
                </button>
            </div>

            {/* ROW 2: Header (Title, Tabs, Action) */}
            <header className="learn-page__header">
                <div className="learn-page__header-left">
                    <h1 className="learn-title">{movement.title}</h1>

                    {/* Sliding Nav Tabs */}
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
                    <button className="btn btn-primary shadow-1">
                        Start Session
                    </button>
                </div>
            </header>

            {/* ROW 3: Content (Video + Sidebar) */}
            <main className="learn-page__content">

                {/* Left: Video */}
                <div className="video-container">
                    {viewMode === 'demo' ? (
                        <div className="video-content">
                            <div className="video-icon-circle">
                                <RiPlayFill size={32} />
                            </div>
                            <p><strong>Demonstration</strong> • {movement.title}</p>
                        </div>
                    ) : (
                        <div className="video-content">
                            <div className="video-icon-circle video-icon-circle--faint">
                                <RiUploadCloud2Line size={32} />
                            </div>
                            <p><strong>Upload your attempt</strong> for analysis</p>
                        </div>
                    )}
                </div>

                {/* Right: Sidebar */}
                <aside className="learn-sidebar shadow-1">
                    {/* CARD 1: Instructions */}
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
                                    <div className="row-content">
                                        {step}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD 2: Guidelines */}
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
                                    <div className="row-content">
                                        {item}
                                    </div>
                                </div>
                            ))}

                            {movement.dontGuidelines.map((item, index) => (
                                <div key={`dont-${index}`} className="sidebar-row">
                                    <div className="row-header">
                                        <span className="row-dot dot--red"></span>
                                        <span className="row-label">DON'T</span>
                                    </div>
                                    <div className="row-content">
                                        {item}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
};