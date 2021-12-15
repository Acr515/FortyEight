import React from "react";

export default function ViewTeamCells({team}) {
    // Calculate average pieces per game
    let pieces = 0;
    team.data.forEach(match => pieces += match.performance.pieces);
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