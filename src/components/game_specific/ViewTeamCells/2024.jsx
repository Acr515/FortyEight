import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2024";
import { EndgameResult } from "data/game_specific/performanceObject/2024";

export default function ViewTeamCells({team}) {
    // Calculate average pieces per game
    let pieces = 0;
    team.data.forEach(match => pieces += ScoreCalculator.Auto.getPieces(match) + ScoreCalculator.Teleop.getPieces(match));
    pieces /= team.data.length;
    pieces = Math.round(pieces * 10) / 10;

    // Calculate average, min and max auton points per game
    let autoPointsAvg = 0, autoPointsMin = 999, autoPointsMax = -1;
    team.data.forEach(match => {
        autoPointsAvg += ScoreCalculator.Auto.getScore(match);
        autoPointsMin = Math.min(autoPointsMin, ScoreCalculator.Auto.getScore(match));
        autoPointsMax = Math.max(autoPointsMax, ScoreCalculator.Auto.getScore(match));
    });
    autoPointsAvg = Math.round((autoPointsAvg / team.data.length) * 10) / 10;

    // Calculate favored scoring location
    let ampNotes = 0, speakerNotes = 0;
    team.data.forEach(match => {
        ampNotes += match.performance.auto.amp + match.performance.teleop.amp;
        speakerNotes += match.performance.auto.speaker + match.performance.teleop.speaker;
    });
    let speakerRate = (ampNotes + speakerNotes <= 0) ? 0 : Math.round((speakerNotes / ampNotes + speakerNotes) * 100) / 10;

    // Count harmonized climbs
    let harmonizedClimbs = 0;
    team.data.forEach(match => harmonizedClimbs += (match.performance.endgame == EndgameResult.HARMONIZED) );

    // Count trap scores
    let trapScores = 0;
    team.data.forEach(match => harmonizedClimbs += (match.performance.endgame == EndgameResult.HARMONIZED) );

    // Calculate climb rate
    let climbFails = 0, climbs = 0;
    team.data.forEach(match => { 
        climbFails += match.performance.endgame.failedAttempt ? 1 : 0
        climbs += ScoreCalculator.Endgame.didClimb(match) || match.performance.endgame.failedAttempt ? 1 : 0
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
                <div className="info-value">{autoPointsAvg}</div>
                <div className="info-label">Avg. Auto</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{autoPointsMin}/{autoPointsMax}</div>
                <div className="info-label">Auto Min/Max</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{speakerRate}%</div>
                <div className="info-label">% Speaker Notes</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{climbs}/{climbs + climbFails}</div>
                <div className="info-label">Climb Success</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{trapScores}/{climbs}</div>
                <div className="info-label">Trap Success</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{harmonizedClimbs}</div>
                <div className="info-label">Harmonized Climbs</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{floorPickup}</div>
                <div className="info-label">Floor Pickup</div>
            </div>
        </>
    )
}