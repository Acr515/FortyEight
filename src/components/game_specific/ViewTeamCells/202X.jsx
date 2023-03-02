import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/202X";

export default function ViewTeamCells({team}) {
    // Calculate average pieces per game
    let pieces = 0;
    team.data.forEach(match => pieces += ScoreCalculator.Auto.getPieces(match) + ScoreCalculator.Teleop.getPieces(match));
    pieces /= team.data.length;
    pieces = Math.round(pieces * 10) / 10;

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{pieces}</div>
                <div className="info-label">Pieces/Game</div>
            </div>
        </>
    )
}