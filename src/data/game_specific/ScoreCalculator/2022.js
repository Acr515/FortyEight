import { EndgameResult } from "../performanceObject/2022";

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
        didClimb: data => { return data.performance.endgame.state != EndgameResult.NONE }
    }
}

export default ScoreCalculator;