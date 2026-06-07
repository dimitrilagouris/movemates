import { type MovementId } from '../../types/movements';
import { type MovementAnalyserFactory } from './MovementAnalyserFactory';
import { OneLeggedStandFactory } from './OneLeggedStandFactory';
import { UnderarmThrowFactory } from './UnderarmThrowFactory';
// import { SquatFactory } from './SquatFactory';

/**
 * Maps movement IDs to their specific factory implementations.
 */
const registry: Record<string, MovementAnalyserFactory> = {
    'one-legged-stand': new OneLeggedStandFactory(),
    'underarm-throw': new UnderarmThrowFactory(),
    // 'squat': new SquatFactory(),
};

/**
 * Retrieves the correct analyser for a given movement ID.
 */
export function getAnalyserInstance(movementId: MovementId) {
    const factory = registry[movementId as string];

    if (!factory) {
        throw new Error(`No factory registered for movement ID: ${movementId}`);
    }

    return factory.createAnalyser();
}