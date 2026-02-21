/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { NONE: "None", LEVEL_1: "Level 1", LEVEL_2: "Level 2", LEVEL_3: "Level 3" };

/**
 * Cycles are individual attempts at scoring. They can be big or small, so they're tracked individually in an array of objects.
 */
export const Cycle = {
    size: 0,
    accuracy: 0,
}

/**
 * Creates a template object for any form fields specific for the game. Notes and defense fields are here but contain no properties
 * @returns An object with all default values for performance
 */
export default function performanceObject() {
    return {
        auto: {
            cycles: [],
            state: EndgameResult.NONE,
        },
        teleop: {
            cycles: [],
        },
        endgame: {
            state: EndgameResult.NONE,
            failedAttempt: false,
        },
        defense: {},
        notes: {}
    }
}

/**
 * A set of fields that are present on forms, but do not exist as keys of the `performanceObject`. This is good to use when the fields
 * of the game form undergo special calculations before being finalized.
 */
export const SpecialFields = {}