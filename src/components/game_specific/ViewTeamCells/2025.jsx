import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2025";

export default function ViewTeamCells({team}) {
    // Calculate average cycles & algae per game
    let cycles = 0, avgAlgae = 0;
    for (const match of team.data) {
        cycles += ScoreCalculator.Teleop.getPieces(match);
        avgAlgae += ScoreCalculator.Teleop.getAlgae(match);
    }
    cycles /= team.data.length;
    avgAlgae /= team.data.length;
    cycles = Math.round(cycles * 10) / 10;
    avgAlgae = Math.round(avgAlgae * 10) / 10;

    // Calculate average auton cycles per game
    let autoCyclesAvg = 0;
    for (const match of team.data) {
        autoCyclesAvg += ScoreCalculator.Auto.getPieces(match);
    }
    autoCyclesAvg = Math.round((autoCyclesAvg / team.data.length) * 10) / 10;

    // Calculate climb rate
    let climbFails = 0, climbs = 0;
    for (const match of team.data) {
        climbFails += match.performance.endgame.failedAttempt;
        climbs += ScoreCalculator.Endgame.didClimb(match);
    }

    // Calculate ability to pick up off floor
    let floorPickup = "No";
    for (const match of team.data) {
        if (match.performance.notes.floorPickup) {
            floorPickup = "Yes";
            break;
        }
    }

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{autoCyclesAvg}</div>
                <div className="info-label">Avg. Auto Cycles</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{cycles}</div>
                <div className="info-label">Avg. Teleop Cycles</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{avgAlgae}</div>
                <div className="info-label">Avg. Teleop Algae</div>
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