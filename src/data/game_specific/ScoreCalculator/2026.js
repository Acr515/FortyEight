import { EndgameResult } from "data/game_specific/performanceObject/2026";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => {
            const auto = data.performance.auto;
            return (
                auto.cycles * auto.fuel * auto.accuracy * 0.01 +
                (auto.state ? 15 : 0)
            );
        },
        getPieces: data => data.performance.auto.cycles * data.performance.auto.fuel * data.performance.auto.accuracy * 0.01,
    },
    Teleop: {
        getScore: data => data.performance.teleop.cycles * data.performance.teleop.fuel * data.performance.teleop.accuracy * 0.01,
        getPieces: data => data.performance.teleop.cycles * data.performance.teleop.fuel * data.performance.teleop.accuracy * 0.01,
    },
    Endgame: {
        // Given a performance object, gets the score
        getScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LEVEL_1: return 10;
                case EndgameResult.LEVEL_2: return 20;
                case EndgameResult.LEVEL_3: return 30;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets the score
        getScoreOfConstant: result => {
            switch (result) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LEVEL_1: return 10;
                case EndgameResult.LEVEL_2: return 20;
                case EndgameResult.LEVEL_3: return 30;
                default: return 0;
            }
        },
        // Given ONLY the EndgameResult value (i.e. no performance object), gets a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb). Used for team's endgame graph
        getNumericalLevel: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.LEVEL_1: return 1;
                case EndgameResult.LEVEL_2: return 2;
                case EndgameResult.LEVEL_3: return 3;
                default: return 0;
            }
        },
        // Given ONLY a numerical index of the climb (i.e. 0 for worst climb, n-1 for best climb), gets the EndgameResult value
        getLevelFromNumber: num => {
            switch (num) {
                case 0: return EndgameResult.NONE;
                case 1: return EndgameResult.LEVEL_1;
                case 2: return EndgameResult.LEVEL_2;
                case 3: return EndgameResult.LEVEL_3;
                default: return EndgameResult.NONE;
            }
        },
        // Given a performance object, returns true if robot climbed, false if no endgame state OR if robot parked
        didClimb: data => data.performance.endgame.state != EndgameResult.NONE,
    }
}

export default ScoreCalculator;