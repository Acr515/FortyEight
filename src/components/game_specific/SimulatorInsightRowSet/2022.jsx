import React from "react";
import SimulatorInsightRow from "components/SimulatorInsightRow";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2022";
import { EndgameResult } from "data/game_specific/performanceObject/2022";

export default function SimulatorInsightRowSet({sim, winner, loser}) {
    
    // Find best cargo scorers
    let winnerBestScorer = -1, loserBestScorer = -1;
    const getBestCargoScorers = teamColor => {
        let bestTeleopScore = -100, climbOfBestScorer = EndgameResult.NONE;
        let bestScorer = -1;
        sim.averageMatch[teamColor].teamPerformances.forEach(team => {
            let score = ScoreCalculator.Teleop.getScore({ performance: team });

            // This line will pick whoever climbs the highest on average if the two best robots score the same # of points
            if (score > bestTeleopScore || (score == bestTeleopScore && ScoreCalculator.Endgame.getScore({ performance: team}) > ScoreCalculator.Endgame.getScoreOfConstant(climbOfBestScorer))) {
                bestTeleopScore = score;
                bestScorer = team.teamNumber;
                climbOfBestScorer = team.endgame.state;
            }
        });
        return bestScorer;
    };
    winnerBestScorer = getBestCargoScorers(winner.colorName);
    loserBestScorer = getBestCargoScorers(loser.colorName);

    return <>
        <SimulatorInsightRow
            label="Strongest Cargo Scorer"
            winnerValue={winnerBestScorer}
            winnerColor={winner.color}
            loserValue={loserBestScorer}
            loserColor={loser.color}
            hyperlinkTeams
        />
        <SimulatorInsightRow
            label="Best Endgame"
            winnerValue={sim[winner.colorName].endgameCeiling}
            winnerColor={winner.color}
            loserValue={sim[loser.colorName].endgameCeiling}
            loserColor={loser.color}
        />
    </>
}