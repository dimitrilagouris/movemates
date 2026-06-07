import type {Movement} from '../types/movements';
import underarmThrowImg from '../assets/under_arm_throw.png';
import oneLeggedStandImg from '../assets/one_legged_standing.png';
import walkingExerciseImg from '../assets/walking_exercising.png';

export const MOVEMENTS: Record<string, Movement> = {
    'underarm-throw': {
        id: 'underarm-throw',
        title: 'Underarm Throw',
        subtitle: 'Practice your throwing skills.',
        description: 'Practice your throwing skills! Toss a ball underhand.',
        imageUrl: underarmThrowImg,
        instructions: [
            "Stand with feet shoulder-width apart",
            "Starting at waist level, swing your arm back",
            "Swing your arm forward",
            "Release the ball with an underarm motion"
        ],
        doGuidelines: [
            "Use proper throwing technique",
            "Follow through with your arm",
            "Keep your eyes on the target"
        ],
        dontGuidelines: [
            "Don't throw overhand",
            "Don't rush the throwing motion",
            "Don't worry if you miss the target"
        ]
    },
    'one-legged-stand': {
        id: 'one-legged-stand',
        title: 'One-Legged Stand',
        subtitle: 'Test your balance.',
        description: 'Test your balance! Stand on one leg and see how long you can stay steady.',
        imageUrl: oneLeggedStandImg,
        instructions: [
            "Stand up straight with your feet together",
            "Lift one foot off the ground",
            "Keep your balance for as long as you can",
            "Try your best and have fun!"
        ],
        doGuidelines: [
            "Keep your arms by your side",
            "Look straight ahead",
            "Stand as still as possible"
        ],
        dontGuidelines: [
            "Don't rest your free leg anywhere",
            "Don't hold onto anything",
            "Don't worry if you wobble"
        ]
    },
    'walking-exercise': {
        id: 'walking-exercise',
        title: 'Walking Exercise',
        subtitle: 'Analyse your gait.',
        description: "Let's see how you walk! Walk across the room in a straight line.",
        imageUrl: walkingExerciseImg,
        instructions: [
            "Stand with your feet shoulder-width apart",
            "Rise up onto your toes",
            "Walk forward while staying on your toes",
            "Keep a straight line as you walk"
        ],
        doGuidelines: [
            "Keep your balance",
            "Keep a steady pace",
            "Keep your posture upright"
        ],
        dontGuidelines: [
            "Don't let your heels touch the ground",
            "Don't rush the movement",
            "Don't lean too far forward"
        ]
    }
};