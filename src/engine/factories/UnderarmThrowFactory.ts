import { type MovementAnalyserFactory } from './MovementAnalyserFactory';
import { UnderarmThrowAnalyser } from '../movements/UnderarmThrowAnalyser';
import { type UnderarmThrowTracker } from '../../types/movements';
import { type MovementAnalyser } from '../../types/MovementAnalyser';

export class UnderarmThrowFactory implements MovementAnalyserFactory {
    createAnalyser(): MovementAnalyser<UnderarmThrowTracker> {
        return new UnderarmThrowAnalyser();
    }
}
