/**
 * Defines the type of the ID of a movement
 */
export type MovementId =
    | 'underarm-throw'
    | 'one-legged-stand'
    | 'walking-exercise';

/**
 * Describes a movement object
 */
export interface Movement {
    id: MovementId;
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;

    instructions: string[];
    doGuidelines: string[];
    dontGuidelines: string[];
}