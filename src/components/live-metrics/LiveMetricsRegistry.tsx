import React, {type RefObject } from 'react';
import type {MovementId} from '../../types/movements';
import {type MovementAnalyser } from '../../types/MovementAnalyser';
import { OneLeggedStandMetrics } from './OneLeggedStandMetrics';
import './style.css'; // import shared CSS for all live metrics cards

export interface LiveMetricsProps {
    movementId: MovementId;
    analyserRef: RefObject<MovementAnalyser<any> | null>;
    currentTimestampRef: RefObject<number>;
}

type LiveMetricsComponent = React.FC<LiveMetricsProps>;

const metricsRegistry: Partial<Record<MovementId, LiveMetricsComponent>> = {
    'one-legged-stand': OneLeggedStandMetrics,
    // Add future metrics components here
};

/**
 * Returns the corresponding live metrics component for a given movement ID.
 * Returns null if no live metrics component is defined for that movement.
 */
export const getLiveMetricsCard = (movementId: MovementId | undefined): LiveMetricsComponent | null => {
    if (!movementId) return null;
    return metricsRegistry[movementId] || null;
};
