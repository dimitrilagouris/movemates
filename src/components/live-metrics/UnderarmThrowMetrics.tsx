import React, { useState, useEffect } from 'react';
import type { LiveMetricsProps } from './LiveMetricsRegistry';
import { UnderarmThrowTracker } from '../../types/movements';

export const UnderarmThrowMetrics: React.FC<LiveMetricsProps> = ({ analyserRef, currentTimestampRef }) => {
    const [metrics, setMetrics] = useState<{
        duration: string;
        swingAngle: string;
        directionState: string;
        validTechnique: string;
        attemptComplete: string;
    } | null>(null);

    useEffect(() => {
        let frameId: number;
        
        const update = () => {
            if (analyserRef.current) {
                const tracker = analyserRef.current.getTrackerState() as unknown as UnderarmThrowTracker;
                
                let durationStr = '0.000';
                if (tracker.attempt_finished) {
                    durationStr = (tracker.duration || 0).toFixed(3);
                } else if (tracker.start_time !== null) {
                    const currentSecs = currentTimestampRef.current / 1000;
                    durationStr = Math.max(0, currentSecs - tracker.start_time).toFixed(3);
                }
                
                const isValid = tracker.throw_valid && tracker.is_underarm;
                
                setMetrics({
                    duration: durationStr,
                    swingAngle: (tracker.total_swing_angle || 0).toFixed(1),
                    directionState: (tracker.direction_state || 'neutral').toUpperCase(),
                    validTechnique: isValid ? 'Yes' : 'No',
                    attemptComplete: tracker.attempt_finished ? 'Yes' : 'No'
                });
            }
            frameId = requestAnimationFrame(update);
        };
        
        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [analyserRef, currentTimestampRef]);

    if (!metrics) return null;

    return (
        <div className="sidebar-card shadow-1 live-metrics-card">
            <div className="live-metrics-top">
                <div className="live-metrics-duration-value">{metrics.duration}</div>
                <div className="live-metrics-duration-label">Duration (Seconds)</div>
            </div>
            
            <div className="live-metrics-bottom">
                <div className="live-metrics-col">
                    <div className="live-metrics-col-header">
                        <span className="live-metrics-icon live-metrics-icon--purple">A</span>
                        <span className="live-metrics-col-title">Swing Angle</span>
                    </div>
                    <div className="live-metrics-col-value live-metrics-mono">
                        {metrics.swingAngle}° / 100°
                    </div>
                </div>
                <div className="live-metrics-col">
                    <div className="live-metrics-col-header">
                        <span className="live-metrics-col-title">Direction</span>
                    </div>
                    <div className="live-metrics-col-value live-metrics-mono">
                        {metrics.directionState}
                    </div>
                </div>
            </div>
            
            <div className="live-metrics-bottom" style={{ marginTop: 'var(--space-2)' }}>
                <div className="live-metrics-col">
                    <div className="live-metrics-col-header">
                        <span className="live-metrics-icon live-metrics-icon--blue">T</span>
                        <span className="live-metrics-col-title">Valid</span>
                    </div>
                    <div className="live-metrics-col-value">
                        {metrics.validTechnique === 'Yes' ? (
                            <span className="live-metrics-badge live-metrics-badge--yes live-metrics-mono">Yes</span>
                        ) : (
                            <span className="live-metrics-badge live-metrics-badge--no live-metrics-mono">No</span>
                        )}
                    </div>
                </div>
                <div className="live-metrics-col">
                    <div className="live-metrics-col-header">
                        <span className="live-metrics-col-title">Complete</span>
                    </div>
                    <div className="live-metrics-col-value">
                        {metrics.attemptComplete === 'Yes' ? (
                            <span className="live-metrics-badge live-metrics-badge--yes live-metrics-mono">Yes</span>
                        ) : (
                            <span className="live-metrics-badge live-metrics-badge--no live-metrics-mono">No</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
