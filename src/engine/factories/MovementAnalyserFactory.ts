import type { MovementAnalyser } from '../../types/MovementAnalyser.ts'

/**
 * The Creator interface declares the factory method that is supposed to return
 * an object of a MovementAnalyser.
 */
export interface MovementAnalyserFactory {
    createAnalyser(): MovementAnalyser<any>;
}