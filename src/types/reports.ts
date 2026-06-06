export interface SwayMetric {
    count: number;
    frequency: number;
}

export interface SwayMetricsMap {
    trunk_lateral: SwayMetric;
    trunk_vertical: SwayMetric;
    pelvic_lateral: SwayMetric;
    pelvic_vertical: SwayMetric;
    ankle_lateral: SwayMetric;
    ankle_vertical: SwayMetric;
}

export interface JointMetricsFrame {
    RShoulderAbduction: number;
    LShoulderAbduction: number;
    RHipAbduction: number;
    LHipAbduction: number;
    RKneeValgus: number;
    LKneeValgus: number;
    RShoulderAbductionVelocity: number;
    LShoulderAbductionVelocity: number;
    RHipAbductionVelocity: number;
    LHipAbductionVelocity: number;
    RKneeValgusVelocity: number;
    LKneeValgusVelocity: number;
}

export interface OneLeggedReportData {
    meta: {
        duration: number;
        frameCount: number;
    };
    swayMetrics: SwayMetricsMap;
    jointMetrics: JointMetricsFrame[];
    armSpanPercents: number[];
}

export interface TimeSeriesPoint {
    time: string;
    [key: string]: number | string;
}