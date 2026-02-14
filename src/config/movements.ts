import type {Movement} from '../types/movements';

export const MOVEMENTS: Record<string, Movement> = {
    'underarm-throw': {
        id: 'underarm-throw',
        title: 'Underarm Throw',
        subtitle: 'Practice your throwing skills.',
        description: 'Practice your throwing skills! Toss a ball underhand.',
        imageUrl: ''
    },
    'one-legged-stand': {
        id: 'one-legged-stand',
        title: 'One-Legged Stand',
        subtitle: 'Test your balance.',
        description: 'Test your balance! Stand on one leg and see how long you can stay steady.',
        imageUrl: ''
    },
    'walking-exercise': {
        id: 'walking-exercise',
        title: 'Walking Exercise',
        subtitle: 'Analyze your gait.',
        description: "Let's see how you walk! Walk across the room in a straight line.",
        imageUrl: ''
    }
};