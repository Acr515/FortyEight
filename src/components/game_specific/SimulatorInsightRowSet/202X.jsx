import React from "react";
import SimulatorInsightRow from "components/SimulatorInsightRow";
import ScoreCalculator from "data/game_specific/ScoreCalculator/202X";

export default function SimulatorInsightRowSet({sim, winner, loser}) {
    
    // Find best game piece scorers
    let winnerBestScorer = -1, loserBestScorer = -1;
    const getBestPieceScorers = teamColor => {
        let bestTeleopScore = -100;
        let bestScorer = -1;
        sim.averageMatch[teamColor].teamPerformances.forEach(team => {
            let score = ScoreCalculator.Teleop.getScore({ performance: team });

            // Normally this section would decide to pick whoever climbs the highest on average if the two best robots score the same # of points
            // But there's no endgame
            if (score > bestTeleopScore) {
                bestTeleopScore = score;
                bestScorer = team.teamNumber;
            }
        });
        return bestScorer;
    };
    winnerBestScorer = getBestPieceScorers(winner.colorName);
    loserBestScorer = getBestPieceScorers(loser.colorName);

    return <>
        <SimulatorInsightRow
            label="Strongest Piece Scorer"
            winnerValue={winnerBestScorer}
            winnerColor={winner.color}
            loserValue={loserBestScorer}
            loserColor={loser.color}
            hyperlinkTeams
        />
    </>
}