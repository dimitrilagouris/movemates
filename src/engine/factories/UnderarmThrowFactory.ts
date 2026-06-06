import { UnderarmThrowAnalyser } from '../movements/UnderarmThrowAnalyser.ts'
import type { MovementAnalyserFactory } from './MovementAnalyserFactory.ts'
import type { MovementAnalyser } from '../../types/MovementAnalyser.ts'

export class UnderarmThrowFactory implements MovementAnalyserFactory {
    createAnalyser(): MovementAnalyser<any> {
        return new UnderarmThrowAnalyser();
    }
}
