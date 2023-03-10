import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2023";

export default function ViewTeamCells({team}) {
    // Calculate average cones per game
    let cones = 0;
    team.data.forEach(match => cones += ScoreCalculator.Auto.getCones(match) + ScoreCalculator.Teleop.getCones(match));
    cones /= team.data.length;
    cones = Math.round(cones * 10) / 10;

    // Calculate average cubes per game
    let cubes = 0;
    team.data.forEach(match => cubes += ScoreCalculator.Auto.getCubes(match) + ScoreCalculator.Teleop.getCubes(match));
    cubes /= team.data.length;
    cubes = Math.round(cubes * 10) / 10;

    // Calculate highest level of scoring per game
    let level = 0, levelString = "-";
    team.data.forEach(match => {
        let matchLevel = 0;
        if (ScoreCalculator.Auto.getHigh(match) + ScoreCalculator.Teleop.getHigh(match) > 0) {
            matchLevel = 3;
        } else if (ScoreCalculator.Auto.getMid(match) + ScoreCalculator.Teleop.getMid(match) > 0) {
            matchLevel = 2;
        } else if (ScoreCalculator.Auto.getLow(match) + ScoreCalculator.Teleop.getLow(match) > 0) {
            matchLevel = 1;
        }
        level = Math.max(level, matchLevel);
    });
    switch (level) {
        case 1: levelString = "Low"; break;
        case 2: levelString = "Mid"; break;
        case 3: levelString = "Top"; break;
        default: levelString = "---";
    }

    // Calculate average auton points per game
    let autoPoints = 0;
    team.data.forEach(match => autoPoints += ScoreCalculator.Auto.getScore(match));
    autoPoints /= team.data.length;
    autoPoints = Math.round(autoPoints * 10) / 10;

    // Calculate climb rate
    let climbFails = 0, climbs = 0;
    team.data.forEach(match => { 
        climbFails += match.performance.endgame.failedAttempt ? 1 : 0
        climbs += ScoreCalculator.Endgame.didClimb(match) || match.performance.endgame.failedAttempt ? 1 : 0
    })

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{cones}</div>
                <div className="info-label">Cones/Game</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{cones}</div>
                <div className="info-label">Cubes/Game</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{levelString}</div>
                <div className="info-label">Node Height</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{autoPoints}</div>
                <div className="info-label">Avg. Auto</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{climbs}/{climbs + climbFails}</div>
                <div className="info-label">Docking Success</div>
            </div>
        </>
    )
}