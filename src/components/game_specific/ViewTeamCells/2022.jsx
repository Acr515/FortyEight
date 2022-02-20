import React from "react";
import ScoreCalculator from "../../../data/game_specific/ScoreCalculator/2022";

export default function ViewTeamCells({team}) {
    // Calculate average pieces per game
    let pieces = 0;
    team.data.forEach(match => pieces += ScoreCalculator.Auto.getPieces(match) + ScoreCalculator.Teleop.getPieces(match));
    pieces /= team.data.length;
    pieces = Math.round(pieces * 10) / 10;

    // Calculate average auton points per game
    let autoPoints = 0;
    team.data.forEach(match => autoPoints += ScoreCalculator.Auto.getScore(match));
    autoPoints /= team.data.length;
    autoPoints = Math.round(autoPoints * 10) / 10;

    // Calculate highest climb location
    let highestClimb = 0;
    team.data.forEach(match => highestClimb = Math.max(ScoreCalculator.Endgame.getNumericalLevel(match), highestClimb));

    // Calculate climb rate
    let climbFails = 0, climbs = 0;
    team.data.forEach(match => { 
        climbFails += match.performance.endgame.failedAttempt ? 1 : 0
        climbs += ScoreCalculator.Endgame.didClimb(match) || match.performance.endgame.failedAttempt ? 1 : 0
    })

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{pieces}</div>
                <div className="info-label">Pieces/Game</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{autoPoints}</div>
                <div className="info-label">Avg. Auto</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{highestClimb > 0 ? ("Lv. " + highestClimb) : "--"}</div>
                <div className="info-label">Best Climb</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{climbs}/{climbs + climbFails}</div>
                <div className="info-label">Climb Success</div>
            </div>
        </>
    )
}