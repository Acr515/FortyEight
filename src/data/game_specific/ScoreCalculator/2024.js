import { EndgameResult } from "data/game_specific/performanceObject/2024";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => data.performance.auto.amp * 2 + data.performance.auto.speaker * 5 + (data.performance.auto.leave ? 2 : 0),
        getPieces: data => data.performance.auto.amp + data.performance.auto.speaker
    },
    Teleop: {
        getScore: data => data.performance.teleop.amp + data.performance.teleop.speaker * 2, // trap is not included because it technically counts as stage points in the manual
        getPieces: data => data.performance.teleop.amp + data.performance.teleop.speaker + (data.performance.endgame.trap), // trap is included because it technically counts as a cycle of a game piece
    },
    // For more details on the typical usage of the Endgame property, refer to the 2022 ScoreCalculator
    Endgame: {
        // Given a performance object, gets the score of all manual-defined "stage" points (climb, trap)
        getScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0 + (data.performance.endgame.trap * 5);
                case EndgameResult.PARKED: return 1 + (data.performance.endgame.trap * 5);
                case EndgameResult.ONSTAGE: return 3 + (data.performance.endgame.trap * 5);
                case EndgameResult.HARMONIZED: return 5 + (data.performance.endgame.trap * 5);
                default: return 0;
            }
        },
        // Given a performance object, gets the score of ONLY the climb output
        getClimbScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 1;
                case EndgameResult.ONSTAGE: return 3;
                case EndgameResult.HARMONIZED: return 5;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets the score
        getScoreOfConstant: result => {
            switch (result) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 1;
                case EndgameResult.ONSTAGE: return 3;
                case EndgameResult.HARMONIZED: return 5;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb). Used for team's endgame graph
        getNumericalLevel: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 1;
                case EndgameResult.ONSTAGE: return 2;
                case EndgameResult.HARMONIZED: return 3;
                default: return 0;
            }
        },
        // Given ONLY a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb), gets the EndgameResult value
        getLevelFromNumber: num => {
            switch (num) {
                case 0: return EndgameResult.NONE;
                case 1: return EndgameResult.PARKED;
                case 2: return EndgameResult.ONSTAGE;
                case 3: return EndgameResult.HARMONIZED;
                default: return EndgameResult.NONE;
            }
        },
        // Given a performance object, returns true if robot climbed, false if no endgame state OR if robot parked
        didClimb: data => data.performance.endgame.state != EndgameResult.NONE && data.performance.endgame.state != EndgameResult.PARKED
    }
}

export default ScoreCalculator;