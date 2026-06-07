import React, { useState, useEffect } from 'react';
import type { LiveMetricsProps } from './LiveMetricsRegistry';

export const OneLeggedStandMetrics: React.FC<LiveMetricsProps> = ({ analyserRef, currentTimestampRef }) => {
    const [metrics, setMetrics] = useState<{ duration: string, liftedLeg: string, validPosture: string } | null>(null);

    useEffect(() => {
        let frameId: number;
        
        const update = () => {
            if (analyserRef.current) {
                const tracker = analyserRef.current.getTrackerState();
                const isValid = analyserRef.current.isPoseValid();
                
                const olsTracker = tracker as any;
                
                let durationStr = '0.000';
                if (olsTracker.attempt_finished) {
                    durationStr = (olsTracker.duration || 0).toFixed(3);
                } else if (olsTracker.start_time !== null) {
                    const currentSecs = currentTimestampRef.current / 1000;
                    durationStr = Math.max(0, currentSecs - olsTracker.start_time).toFixed(3);
                }
                
                let legLabel = 'None';
                if (olsTracker.lifted_leg === 'left') legLabel = 'Left';
                else if (olsTracker.lifted_leg === 'right') legLabel = 'Right';
                
                setMetrics({
                    duration: durationStr,
                    liftedLeg: legLabel,
                    validPosture: isValid ? 'Yes' : 'No'
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
                        <span className="live-metrics-col-title">Leg Lifted</span>
                    </div>
                    <div className={`live-metrics-col-value live-metrics-mono ${metrics.liftedLeg === 'None' ? 'live-metrics-col-value--faint' : ''}`}>
                        {metrics.liftedLeg || 'None'}
                    </div>
                </div>
                <div className="live-metrics-col">
                    <div className="live-metrics-col-header">
                        <span className="live-metrics-col-title">Posture</span>
                    </div>
                    <div className="live-metrics-col-value">
                        {metrics.validPosture === 'Yes' ? (
                            <span className="live-metrics-badge live-metrics-badge--yes live-metrics-mono">{metrics.validPosture}</span>
                        ) : (
                            <span className="live-metrics-badge live-metrics-badge--no live-metrics-mono">{metrics.validPosture}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
