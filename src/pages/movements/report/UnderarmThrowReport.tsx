import { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    RiTimerLine, RiUserLine, RiCheckLine, RiCloseLine, RiScales3Line
} from "react-icons/ri";
import { StatCard } from '../../../components/common/StatCard';
import type { UnderarmThrowTracker } from '../../../engine/movements/UnderarmThrowAnalyser';
import { UnderarmThrowExportStrategy } from '../../../engine/export/UnderarmThrowExportStrategy';
import './style.css';

// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="custom-tooltip-label">{`${label}s`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={`item-${index}`} className="custom-tooltip-item" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toFixed(2)}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const UnderarmThrowReport = ({ tracker }: { tracker: UnderarmThrowTracker }): JSX.Element => {
    
    const chartData = useMemo(() => {
        return UnderarmThrowExportStrategy.generateChartData(tracker);
    }, [tracker]);

    const maxVals = useMemo(() => {
        if (!chartData.length) return null;
        return {
            lShoulderFlexion: Math.max(...chartData.map(d => Math.abs(d.lShoulderFlexion))),
            rShoulderFlexion: Math.max(...chartData.map(d => Math.abs(d.rShoulderFlexion))),
            lShoulderAbd: Math.max(...chartData.map(d => Math.abs(d.lShoulderAbd))),
            rShoulderAbd: Math.max(...chartData.map(d => Math.abs(d.rShoulderAbd))),
            hipRotation: Math.max(...chartData.map(d => Math.abs(d.hipRotation))),
            trunkRotation: Math.max(...chartData.map(d => Math.abs(d.trunkRotation))),
            lKneeVel: Math.max(...chartData.map(d => Math.abs(d.lKneeVel))),
            rKneeVel: Math.max(...chartData.map(d => Math.abs(d.rKneeVel))),
            trunkRotVel: Math.max(...chartData.map(d => Math.abs(d.trunkRotVel))),
        }
    }, [chartData]);

    const isSuccess = tracker.throw_valid;
    const isCompleted = tracker.attempt_finished;

    return (
        <>
            <div className="report-stats-row">
                <StatCard 
                    title="Duration"
                    icon={<RiTimerLine />}
                    value={`${tracker.duration.toFixed(2)}s`}
                    status={isCompleted ? 'success' : 'neutral'}
                    statusIcon={<RiCheckLine />}
                    statusText={isCompleted ? "Completed" : "Incomplete"}
                    detailText="Overall time"
                />

                <StatCard 
                    title="Throwing Arm"
                    icon={<RiUserLine />}
                    value={tracker.throwing_arm === 'left' ? "Left" : "Right"}
                    status="neutral"
                    statusIcon={<RiCheckLine />}
                    statusText="Recorded"
                    detailText="Arm used"
                />

                <StatCard 
                    title="Validity"
                    icon={<RiScales3Line />}
                    value={isSuccess ? "Valid" : "Invalid"}
                    status={isSuccess ? 'success' : 'error'}
                    statusIcon={isSuccess ? <RiCheckLine /> : <RiCloseLine />}
                    statusText={isSuccess ? "Good form" : "Poor form"}
                    detailText="Technique check"
                />
            </div>

            <div className="report-charts-row">
                {/* Shoulder Flexion Chart */}
                <div className="report-card report-card--chart shadow-1">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Shoulder Flexion/Extension</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lShoulderFlexion.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rShoulderFlexion.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
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
                            <Line type="monotone" dataKey="lShoulderFlexion" name="Left Shoulder" stroke="var(--colour-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-blue-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-blue-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="rShoulderFlexion" name="Right Shoulder" stroke="var(--colour-teal-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-teal-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-teal-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Shoulder Abduction Chart */}
                <div className="report-card report-card--chart shadow-1">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Shoulder Abduction/Adduction</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lShoulderAbd.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rShoulderAbd.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
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

                {/* Rotations */}
                <div className="report-card report-card--chart shadow-1">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Transverse Rotation</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left" style={{color: 'var(--colour-orange-600)'}}>{maxVals?.hipRotation.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left" style={{backgroundColor: 'var(--colour-orange-100)', color: 'var(--colour-orange-600)'}}>Hip</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right" style={{color: 'var(--colour-green-600)'}}>{maxVals?.trunkRotation.toFixed(0)}°</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right" style={{backgroundColor: 'var(--colour-green-100)', color: 'var(--colour-green-600)'}}>Trunk</div>
                                    <div className="chart-stat-desc">Maximum Peak</div>
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
                            <Line type="monotone" dataKey="hipRotation" name="Hip Rotation" stroke="var(--colour-orange-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-orange-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-orange-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="trunkRotation" name="Trunk Rotation" stroke="var(--colour-green-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-green-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-green-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Knee Velocity */}
                <div className="report-card report-card--chart shadow-1">
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Knee Flexion Velocity</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left">{maxVals?.lKneeVel.toFixed(0)}</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left">Left</div>
                                    <div className="chart-stat-desc">Peak °/s</div>
                                </div>
                            </div>
                            <div className="chart-stat-divider"></div>
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--right">{maxVals?.rKneeVel.toFixed(0)}</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--right">Right</div>
                                    <div className="chart-stat-desc">Peak °/s</div>
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
                            <Line type="monotone" dataKey="lKneeVel" name="Left Knee" stroke="var(--colour-blue-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-blue-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-blue-500) 40%, transparent))' }} />
                            <Line type="monotone" dataKey="rKneeVel" name="Right Knee" stroke="var(--colour-teal-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-teal-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-teal-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Trunk Velocity */}
                <div className="report-card report-card--chart shadow-1" style={{ gridColumn: '1 / -1' }}>
                    <div className="chart-header">
                        <div className="report-card__title report-card__title--peak">Trunk Rotation Velocity</div>
                        <div className="chart-stats-row">
                            <div className="chart-stat-block">
                                <div className="chart-stat-val chart-stat-val--left" style={{color: 'var(--colour-pink-600)'}}>{maxVals?.trunkRotVel.toFixed(0)}</div>
                                <div className="chart-stat-info">
                                    <div className="chart-stat-badge chart-stat-badge--left" style={{backgroundColor: 'var(--colour-pink-100)', color: 'var(--colour-pink-600)'}}>Trunk</div>
                                    <div className="chart-stat-desc">Peak °/s</div>
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
                            <Line type="monotone" dataKey="trunkRotVel" name="Trunk Velocity" stroke="var(--colour-pink-500)" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--colour-pink-500)' }} style={{ filter: 'drop-shadow(0px 4px 6px color-mix(in srgb, var(--colour-pink-500) 40%, transparent))' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </>
    );
};
