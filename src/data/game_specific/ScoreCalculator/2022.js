import { EndgameResult } from "data/game_specific/performanceObject/2022";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => data.performance.auto.cargoLow * 2 + data.performance.auto.cargoHigh * 4 + (data.performance.auto.taxi ? 2 : 0),
        getPieces: data => data.performance.auto.cargoLow + data.performance.auto.cargoHigh
    },
    Teleop: {
        getScore: data => data.performance.teleop.cargoLow + data.performance.teleop.cargoHigh * 2,
        getPieces: data => data.performance.teleop.cargoLow + data.performance.teleop.cargoHigh,
    },
    Endgame: {
        // Given a performance object, gets the score
        getScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LOW_RUNG: return 4;
                case EndgameResult.MID_RUNG: return 6;
                case EndgameResult.HIGH_RUNG: return 10;
                case EndgameResult.TRAVERSAL_RUNG: return 15;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets the score
        getScoreOfConstant: result => {
            switch (result) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LOW_RUNG: return 4;
                case EndgameResult.MID_RUNG: return 6;
                case EndgameResult.HIGH_RUNG: return 10;
                case EndgameResult.TRAVERSAL_RUNG: return 15;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb). Used for team's endgame graph
        getNumericalLevel: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LOW_RUNG: return 1;
                case EndgameResult.MID_RUNG: return 2;
                case EndgameResult.HIGH_RUNG: return 3;
                case EndgameResult.TRAVERSAL_RUNG: return 4;
                default: return 0;
            }
        },
        // Given ONLY a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb), gets the EndgameResult value
        getLevelFromNumber: num => {
            switch (num) {
                case 0: return EndgameResult.NONE;
                case 1: return EndgameResult.LOW_RUNG;
                case 2: return EndgameResult.MID_RUNG;
                case 3: return EndgameResult.HIGH_RUNG;
                case 4: return EndgameResult.TRAVERSAL_RUNG;
                default: return EndgameResult.NONE;
            }
        },
        // Given a performance object, returns true if robot climbed, false if no endgame state OR if robot parked
        didClimb: data => { return data.performance.endgame.state != EndgameResult.NONE }
    }
}

export default ScoreCalculator;