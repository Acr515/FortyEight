/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { NONE: "None", PARKED: "Parked", ONSTAGE: "On Stage", HARMONIZED: "Harmonized" };

/**
 * Creates a template object for any form fields specific for the game. Notes and defense fields are here but contain no properties
 * @returns An object with all default values for performance
 */
export default function performanceObject() {
    return {
        auto: {
            leave: false,
            amp: 0,
            speaker: 0
        },
        teleop: {
            amp: 0,
            speaker: 0
        },
        endgame: {
            state: EndgameResult.NONE,
            failedAttempt: false,
            trap: false
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