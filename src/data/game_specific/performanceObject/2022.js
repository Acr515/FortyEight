/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { NONE: "None", LOW_RUNG: "Low Rung", MID_RUNG: "Mid Rung", HIGH_RUNG: "High Rung", TRAVERSAL_RUNG: "Traversal Rung" };

/**
 * Creates a template object for any form fields specific for the game. Notes and defense fields are here but contain no properties
 * @returns An object with all default values for performance
 */
export default function performanceObject() {
    return {
        auto: {
            taxi: false,
            cargoLow: 0,
            cargoHigh: 0
        },
        teleop: {
            cargoLow: 0,
            cargoHigh: 0
        },
        endgame: {
            state: EndgameResult.NONE,
            failedAttempt: false
        },
        defense: {},
        notes: {}
    }
}