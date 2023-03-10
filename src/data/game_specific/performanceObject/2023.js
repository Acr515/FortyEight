/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { NONE: "None", PARKED: "Parked", DOCKED: "Docked", DOCKED_AND_ENGAGED: "Docked and Engaged" };

/**
 * Creates a template object for any form fields specific for the game. Notes and defense fields are here but contain no properties
 * @returns An object with all default values for performance
 */
export default function performanceObject() {
    return {
        auto: {
            mobility: false,
            docked: false,
            engaged: false,
            coneLow: 0,
            coneMid: 0,
            coneHigh: 0,
            cubeLow: 0,
            cubeMid: 0,
            cubeHigh: 0,
        },
        teleop: {
            coneLow: 0,
            coneMid: 0,
            coneHigh: 0,
            cubeLow: 0,
            cubeMid: 0,
            cubeHigh: 0,
        },
        endgame: {
            state: EndgameResult.NONE,
            failedAttempt: false
        },
        defense: {},
        notes: {}
    }
}

/**
 * A set of fields that are present on forms, but do not exist as keys of the `performanceObject`. This is good to use when the fields
 * of the game form undergo special calculations before being finalized.
 */
export const SpecialFields = {
    auto: {
        state: (performance, value) => {
            if (value == EndgameResult.DOCKED) {
                performance.auto.docked = true;
                performance.auto.engaged = false;
            } else if (value == EndgameResult.DOCKED_AND_ENGAGED) {
                performance.auto.docked = true;
                performance.auto.engaged = true;
            } else {
                performance.auto.docked = false;
                performance.auto.engaged = false;
            }
        }
    }
}