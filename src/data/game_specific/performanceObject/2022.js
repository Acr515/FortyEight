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
            cargoHigh: 0,
            getScore: () => this.auto.cargoLow * 2 + this.auto.cargoHigh * 4,
            getPieces: () => this.auto.cargoLow + this.auto.cargoHigh
        },
        teleop: {
            cargoLow: 0,
            cargoHigh: 0,
            getScore: () => this.teleop.cargoLow + this.teleop.cargoHigh * 2,
            getPieces: () => this.teleop.cargoLow + this.teleop.cargoHigh
        },
        endgame: {
            state: EndgameResult.NONE,
            failedAttempt: false,
            getScore: () => {
                switch (this.endgame.state) {
                    case EndgameResult.NONE: return 0;
                    case EndgameResult.LOW_RUNG: return 4;
                    case EndgameResult.MID_RUNG: return 6;
                    case EndgameResult.HIGH_RUNG: return 10;
                    case EndgameResult.TRAVERSAL_RUNG: return 15;
                    default: return 0;
                }
            }
        },
        defense: {},
        notes: {}
    }
}