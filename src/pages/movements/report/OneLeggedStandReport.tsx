import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { type OneLeggedReportData, type TimeSeriesPoint } from '../../../types/reports';
import './style.css';

// --- Pure Data Transformers ---

const buildArmSpanData = (percents: number[], duration: number): TimeSeriesPoint[] => {
    return percents.map((val, idx) => ({
        time: ((idx / percents.length) * duration).toFixed(1),
        Extension: val * 100
    }));
};

const buildJointData = (frames: any[], duration: number): TimeSeriesPoint[] => {
    return frames.map((frame, idx) => ({
        time: ((idx / frames.length) * duration).toFixed(1),
        RightKnee: frame.RKneeValgus,
        LeftKnee: frame.LKneeValgus
    }));
};

// --- UI Sub-Components ---

const MetricCard = ({ title, value, unit }: { title: string, value: number, unit: string }) => (
    <div className="report-card shadow-1">
        <h4 className="report-card__title">{title}</h4>
        <div className="report-card__value">
            {value.toFixed(2)} <span className="report-card__unit">{unit}</span>
        </div>
    </div>
);

const SwaySummaryGrid = ({ metrics }: { metrics: OneLeggedReportData['swayMetrics'] }) => (
    <section className="report-section">
        <h3 className="report-section__header">Instability Metrics (Sway Frequency)</h3>
        <div className="report-grid">
            <MetricCard title="Trunk Lateral Sway" value={metrics.trunk_lateral.frequency} unit="Hz" />
            <MetricCard title="Pelvic Lateral Sway" value={metrics.pelvic_lateral.frequency} unit="Hz" />
            <MetricCard title="Ankle Lateral Sway" value={metrics.ankle_lateral.frequency} unit="Hz" />
        </div>
    </section>
);

const TimeSeriesChart = ({ data, lines, yLabel }: { data: TimeSeriesPoint[], lines: { key: string, colour: string }[], yLabel: string }) => (
    <div className="chart-container shadow-1">
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={30} />
                <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 15 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                {lines.map(line => (
                    <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.colour}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
);

// --- Main Report Component ---

export const OneLeggedStandReport = ({ reportData }: { reportData: OneLeggedReportData }) => {
    const { duration } = reportData.meta;

    const armSpanData = buildArmSpanData(reportData.armSpanPercents, duration);
    const jointData = buildJointData(reportData.jointMetrics, duration);

    return (
        <div className="report-layout">
            <header className="report-header">
                <h2>One-Legged Stand Analysis</h2>
                <p>Duration: {duration.toFixed(1)}s • Frames Analysed: {reportData.meta.frameCount}</p>
            </header>

            <SwaySummaryGrid metrics={reportData.swayMetrics} />

            <section className="report-section">
                <div className="report-section__header-group">
                    <h3 className="report-section__header">Balance Compensation (Arm Flailing)</h3>
                    <p className="report-section__desc">Values exceeding 100% indicate arms extending outward to regain centre of gravity.</p>
                </div>
                <TimeSeriesChart
                    data={armSpanData}
                    lines={[{ key: 'Extension', colour: '#0f172a' }]}
                    yLabel="Arm Span (%)"
                />
            </section>

            <section className="report-section">
                <div className="report-section__header-group">
                    <h3 className="report-section__header">Knee Stability (Valgus Collapse)</h3>
                    <p className="report-section__desc">Tracks inward collapsing angles of the knees during the hold.</p>
                </div>
                <TimeSeriesChart
                    data={jointData}
                    lines={[
                        { key: 'RightKnee', colour: '#3b82f6' },
                        { key: 'LeftKnee', colour: '#f59e0b' }
                    ]}
                    yLabel="Angle (°)"
                />
            </section>
        </div>
    );
};