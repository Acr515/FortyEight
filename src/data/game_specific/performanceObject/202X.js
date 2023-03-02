/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { NONE: "None" };

/**
 * Creates a template object for any form fields specific for the game. Notes and defense fields are here but contain no properties
 * @returns An object with all default values for performance
 */
export default function performanceObject() {
    return {
        auto: {
            cross: false,
            pieces: 0
        },
        teleop: {
            pieces: 0
        },
        endgame: {},
        defense: {},
        notes: {}
    }
}