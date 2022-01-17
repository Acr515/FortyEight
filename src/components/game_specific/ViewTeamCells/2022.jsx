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

    // Calculate success rate for climbs and determine highest climb location

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
        </>
    )
}