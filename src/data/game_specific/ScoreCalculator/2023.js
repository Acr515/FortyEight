import { EndgameResult } from "data/game_specific/performanceObject/2023";

/**
 * Takes a match performance object and outputs scoring data related to certain parts of the game (auto, teleop, endgame scores)
 */
const ScoreCalculator = {
    Auto: {
        getScore: data => 
            (data.performance.auto.coneLow + data.performance.auto.cubeLow) * 3 + 
            (data.performance.auto.coneMid + data.performance.auto.cubeMid) * 4 + 
            (data.performance.auto.coneHigh + data.performance.auto.cubeHigh) * 6 + 
            data.performance.auto.mobility ? 3 : 0 +
            data.performance.auto.docked ? 8 : 0 +
            data.performance.auto.docked && data.performance.auto.engaged ? 4 : 0,
        getGridScore: data => {
            let score = 0;
            if (data.performance.auto.docked) score += 8;
            if (data.performance.auto.engaged) score += 8;
            return score;
        },
        getPieces: data => 
            data.performance.auto.coneLow + data.performance.auto.cubeLow + 
            data.performance.auto.coneMid + data.performance.auto.cubeMid + 
            data.performance.auto.coneHigh + data.performance.auto.cubeHigh,
        getCones: data =>
            data.performance.auto.coneLow + 
            data.performance.auto.coneMid + 
            data.performance.auto.coneHigh,
        getCubes: data =>
            data.performance.auto.cubeLow + 
            data.performance.auto.cubeMid + 
            data.performance.auto.cubeHigh,
        getLow: data => data.performance.auto.cubeLow + data.performance.auto.coneLow,
        getMid: data => data.performance.auto.cubeMid + data.performance.auto.coneMid,
        getHigh: data => data.performance.auto.cubeHigh + data.performance.auto.coneHigh,
        getEndgameEquivalent: data =>
            data.performance.auto.docked && data.performance.auto.engaged ? EndgameResult.DOCKED_AND_ENGAGED :
            data.performance.auto.docked ? EndgameResult.DOCKED : EndgameResult.NONE
    },
    Teleop: {
        getScore: data => 
            (data.performance.teleop.coneLow + data.performance.teleop.cubeLow) * 2 + 
            (data.performance.teleop.coneMid + data.performance.teleop.cubeMid) * 3 + 
            (data.performance.teleop.coneHigh + data.performance.teleop.cubeHigh) * 5,
        getPieces: data => 
            data.performance.teleop.coneLow + data.performance.teleop.cubeLow + 
            data.performance.teleop.coneMid + data.performance.teleop.cubeMid + 
            data.performance.teleop.coneHigh + data.performance.teleop.cubeHigh,
        getCones: data =>
            data.performance.teleop.coneLow + 
            data.performance.teleop.coneMid + 
            data.performance.teleop.coneHigh,
        getCubes: data =>
            data.performance.teleop.cubeLow + 
            data.performance.teleop.cubeMid + 
            data.performance.teleop.cubeHigh,
        getLow: data => data.performance.teleop.cubeLow + data.performance.teleop.coneLow,
        getMid: data => data.performance.teleop.cubeMid + data.performance.teleop.coneMid,
        getHigh: data => data.performance.teleop.cubeHigh + data.performance.teleop.coneHigh,
        getLinkScore: links => links * 5
    },
    Endgame: {
        getScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 2;
                case EndgameResult.DOCKED: return 6;
                case EndgameResult.DOCKED_AND_ENGAGED: return 10;
                default: return 0;
            }
        },
        getGridScore: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.DOCKED: return 6;
                case EndgameResult.DOCKED_AND_ENGAGED: return 10;
                default: return 0;
            }
        },
        getScoreOfConstant: result => {
            switch (result) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 2;
                case EndgameResult.DOCKED: return 6;
                case EndgameResult.DOCKED_AND_ENGAGED: return 10;
                default: return 0;
            }
        },
        getNumericalLevel: data => {
            switch (data.performance.endgame.state) {
                case EndgameResult.NONE: return 0;
                case EndgameResult.PARKED: return 1;
                case EndgameResult.DOCKED: return 2;
                case EndgameResult.DOCKED_AND_ENGAGED: return 3;
                default: return 0;
            }
        },
        getLevelFromNumber: num => {
            switch (num) {
                case 0: return EndgameResult.NONE;
                case 1: return EndgameResult.PARKED;
                case 2: return EndgameResult.DOCKED;
                case 3: return EndgameResult.DOCKED_AND_ENGAGED;
                default: return EndgameResult.NONE;
            }
        },
        didClimb: data => data.performance.endgame.state != EndgameResult.NONE && data.performance.endgame.state != EndgameResult.DOCKED
    }
}

export default ScoreCalculator;