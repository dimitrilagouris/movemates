import { OneLeggedStandAnalyser } from '../movements/OneLeggedStandAnalyser.ts'
import type { MovementAnalyserFactory } from './MovementAnalyserFactory.ts'
import type { MovementAnalyser } from '../../types/MovementAnalyser.ts'

export class OneLeggedStandFactory implements MovementAnalyserFactory {
    createAnalyser(): MovementAnalyser<T> {
        return new OneLeggedStandAnalyser();
    }
}