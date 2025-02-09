import { EndgameResult } from "data/game_specific/performanceObject/2025";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => {
            const auto = data.performance.auto;
            return (
                (auto.coralL1 * 3) + (auto.coralL2 * 4) + (auto.coralL3 * 6) + (auto.coral4 * 7) +
                (auto.algaeLow * 6) + (auto.algaeHigh * 4) +
                (auto.leave ? 3 : 0)
            );
        },
        getPieces: data => {
            const auto = data.performance.auto;
            return (
                auto.coralL1 + auto.coralL2 + auto.coralL3 + auto.coralL4 + auto.algaeLow + auto.algaeHigh
            );
        }
    },
    Teleop: {
        getScore: data => {
            const teleop = data.performance.teleop;
            return (
                (teleop.coralL1 * 2) + (teleop.coralL2 * 3) + (teleop.coralL3 * 4) + (teleop.coral4 * 5) +
                (teleop.algaeLow * 6) + (teleop.algaeHigh * 4)
            );
        },
        getPieces: data => {
            const teleop = data.performance.auto;
            return (
                teleop.coralL1 + teleop.coralL2 + teleop.coralL3 + teleop.coralL4 + teleop.algaeLow + teleop.algaeHigh
            );
        },
    },
    Endgame: {
        // Given a performance object, gets the score
        getScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARK: return 2;
                case EndgameResult.SHALLOW_CAGE: return 6;
                case EndgameResult.DEEP_CAGE: return 12;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets the score
        getScoreOfConstant: result => {
            switch (result) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARK: return 2;
                case EndgameResult.SHALLOW_CAGE: return 6;
                case EndgameResult.DEEP_CAGE: return 12;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb). Used for team's endgame graph
        getNumericalLevel: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARK: return 1;
                case EndgameResult.SHALLOW_CAGE: return 2;
                case EndgameResult.DEEP_CAGE: return 3;
                default: return 0;
            }
        },
        // Given ONLY a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb), gets the EndgameResult value
        getLevelFromNumber: num => {
            switch (num) {
                case 0: return EndgameResult.NONE;
                case 1: return EndgameResult.PARK;
                case 2: return EndgameResult.SHALLOW_CAGE;
                case 3: return EndgameResult.DEEP_CAGE;
                default: return EndgameResult.NONE;
            }
        },
        // Given a performance object, returns true if robot climbed, false if no endgame state OR if robot parked
        didClimb: data => { return data.performance.endgame.state != EndgameResult.NONE && data.performance.endgame.state != EndgameResult.PARK }
    }
}

export default ScoreCalculator;