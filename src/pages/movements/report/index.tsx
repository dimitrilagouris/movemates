import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    RiArrowLeftLine, RiFileChartLine, RiAlertLine, 
    RiTimerLine, RiUserLine, RiScales3Line, RiRulerLine, 
    RiMore2Fill, RiArrowDownLine, RiCheckLine, RiCloseLine 
} from "react-icons/ri";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { MOVEMENTS } from '../../../config/movements';
import { type MovementId, type Movement } from '../../../types/movements';
import { DatabaseEngine } from '../../../engine/db';
import { Button } from '../../../components/common/Button';
import { StatCard } from '../../../components/common/StatCard';
import { type OneLeggedStandTracker } from '../../../engine/movements/OneLeggedStandAnalyser';
import { ReportExporter, OneLeggedStandExportStrategy } from '../../../engine/export';
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
        <div className="report-container">
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
                        Assessment Report
                    </h1>
                </div>
                <div className="report-header__actions">
                    <Button variant="text" onClick={() => {}}>Share</Button>
                    <Button variant="primary" className="shadow-1" onClick={() => {
                        const exporter = new ReportExporter();
                        exporter.export(movementId, latestTracker);
                    }}>Save</Button>
                </div>
            </header>

            <main className="report-page">
                <div className="report-disclaimer">
                    <RiAlertLine size={20} className="report-disclaimer__icon" />
                    <p className="report-disclaimer__text">
                        <strong>Disclaimer:</strong> This automated assessment is intended for informational purposes only. Please consult your physiotherapist or a qualified healthcare professional before making any medical decisions based on these results.
                    </p>
                </div>

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

// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="custom-tooltip-label">{`${label}s`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} className="custom-tooltip-item" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}°
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const OneLeggedStandReport = ({ tracker }: { tracker: OneLeggedStandTracker }) => {
    const isSuccessDuration = tracker.duration > 10;
    const isCorrectForm = !tracker.legs_crossed;

    const chartData = useMemo(() => {
        return OneLeggedStandExportStrategy.generateChartData(tracker);
    }, [tracker]);

    const maxVals = useMemo(() => {
        if (!chartData.length) return null;
        return {
            lShoulder: Math.max(...chartData.map(d => d.lShoulderAbd)),
            rShoulder: Math.max(...chartData.map(d => d.rShoulderAbd)),
            lHip: Math.max(...chartData.map(d => d.lHipAbd)),
            rHip: Math.max(...chartData.map(d => d.rHipAbd)),
            lKnee: Math.max(...chartData.map(d => d.lKneeValgus)),
            rKnee: Math.max(...chartData.map(d => d.rKneeValgus)),
        }
    }, [chartData]);

    return (
        <>
            <div className="report-stats-row">
                {/* Card 1: Hold Duration */}
                <StatCard 
                    title="Hold Duration"
                    icon={<RiTimerLine />}
                    value={`${tracker.duration.toFixed(2)}s`}
                    status={isSuccessDuration ? 'success' : 'error'}
                    statusIcon={isSuccessDuration ? <RiCheckLine /> : <RiArrowDownLine />}
                    statusText={isSuccessDuration ? "Great balance!" : "Keep practicing"}
                    detailText="Overall time"
                />

                {/* Card 2: Leg Used */}
                <StatCard 
                    title="Leg Used"
                    icon={<RiUserLine />}
                    value={tracker.lifted_leg ? (tracker.lifted_leg === 'left' ? "Left" : "Right") : "N/A"}
                    status="neutral"
                    statusIcon={<RiCheckLine />}
                    statusText="Recorded"
                    detailText={`Supporting: ${tracker.supporting_leg ?? "N/A"}`}
                />

                {/* Card 3: Form Accuracy */}
                <StatCard 
                    title="Form Accuracy"
                    icon={<RiScales3Line />}
                    value={isCorrectForm ? "Correct" : "Incorrect"}
                    status={isCorrectForm ? 'success' : 'error'}
                    statusIcon={isCorrectForm ? <RiCheckLine /> : <RiCloseLine />}
                    statusText={isCorrectForm ? "Perfect form" : "Crossed midline"}
                    detailText="Legs position"
                />

                {/* Card 4: Calibrated Armspan */}
                <StatCard 
                    title="Armspan"
                    icon={<RiRulerLine />}
                    value={tracker.armspan > 0 ? `${tracker.armspan.toFixed(2)}m` : "N/A"}
                    status="neutral"
                    statusIcon={<RiCheckLine />}
                    statusText="Calibrated"
                    detailText="Initial phase"
                />
            </div>

            <div className="report-charts-row">
                {/* Shoulder Abduction Chart */}
                <div className="report-card report-card--chart">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Peak Shoulder Abduction</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lShoulder}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rShoulder}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e4e4e7" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span className="recharts-legend-item-text">{value}</span>} />
                            <Line type="monotone" dataKey="lShoulderAbd" name="Left Shoulder" stroke="var(--colour-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-blue-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-blue-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="rShoulderAbd" name="Right Shoulder" stroke="var(--colour-teal-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-teal-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-teal-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Hip Abduction Chart */}
                <div className="report-card report-card--chart">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Peak Hip Abduction</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lHip}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rHip}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e4e4e7" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span className="recharts-legend-item-text">{value}</span>} />
                            <Line type="monotone" dataKey="lHipAbd" name="Left Hip" stroke="var(--colour-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-blue-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-blue-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="rHipAbd" name="Right Hip" stroke="var(--colour-teal-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-teal-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-teal-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Knee Valgus Chart */}
                <div className="report-card report-card--chart" style={{ gridColumn: '1 / -1' }}>
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Peak Knee Valgus Deviation</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lKnee}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rKnee}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Maximum degrees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e4e4e7" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                            <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span className="recharts-legend-item-text">{value}</span>} />
                            <Line type="monotone" dataKey="lKneeValgus" name="Left Knee" stroke="var(--colour-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-blue-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-blue-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="rKneeValgus" name="Right Knee" stroke="var(--colour-teal-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-teal-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-teal-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};
