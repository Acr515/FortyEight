import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2025";

export default function ViewTeamCells({team}) {
    // Calculate average pieces per game
    let pieces = 0, cycles = 0;
    team.data.forEach(match => {
        pieces += ScoreCalculator.Auto.getPieces(match) + ScoreCalculator.Teleop.getPieces(match);
        cycles += ScoreCalculator.Teleop.getPieces(match);
    });
    pieces /= team.data.length;
    pieces = Math.round(pieces * 10) / 10;
    cycles /= team.data.length;
    cycles = Math.round(cycles * 10) / 10;

    // Calculate average auton points per game
    let autoPointsAvg = 0;
    team.data.forEach(match => {
        autoPointsAvg += ScoreCalculator.Auto.getScore(match);
    });
    autoPointsAvg = Math.round((autoPointsAvg / team.data.length) * 10) / 10;

    // Calculate climb rate
    let climbFails = 0, climbs = 0;
    team.data.forEach(match => { 
        climbFails += match.performance.endgame.failedAttempt;
        climbs += ScoreCalculator.Endgame.didClimb(match);
    });

    // Calculate ability to pick up off floor
    let floorPickup = "No";
    team.data.forEach(match => {
        if (match.performance.notes.floorPickup) floorPickup = "Yes";
    });

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{pieces}</div>
                <div className="info-label">Pieces/Game</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{cycles}</div>
                <div className="info-label">Avg. Teleop Cycles</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{autoPointsAvg}</div>
                <div className="info-label">Avg. Auto</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{climbs}/{climbs + climbFails}</div>
                <div className="info-label">Climb Success</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{floorPickup}</div>
                <div className="info-label">Floor Pickup</div>
            </div>
        </>
    )
}