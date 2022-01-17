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
        }
    }
}

export default ScoreCalculator;