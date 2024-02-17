import { EndgameResult } from "data/game_specific/performanceObject/202X";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => data.performance.auto.pieces * 4 + (data.performance.auto.cross ? 2 : 0),
        getPieces: data => data.performance.auto.pieces
    },
    Teleop: {
        getScore: data => data.performance.teleop.pieces * 2,
        getPieces: data => data.performance.teleop.pieces,
    },
    // For more details on the typical usage of the Endgame property, refer to the 2022 ScoreCalculator
    Endgame: {
        getScore: data => 0,
        getScoreOfConstant: result => 0,
        getNumericalLevel: data => 0,
        getLevelFromNumber: num => 0,
        didClimb: data => 0
    }
}

export default ScoreCalculator;