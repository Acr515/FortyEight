import React from "react";
import SimulatorInsightRow from "components/SimulatorInsightRow";

export default function SimulatorInsightRowSet({sim, winner, loser}) {
    
    // Find best grid scorers
    let winnerBestScorer = -1, loserBestScorer = -1;
    const getBestGridScorers = teamColor => {
        let bestGridScore = -100, bestScorer = -1;
        Object.keys(sim[teamColor].gridContributions).forEach(team => {
            let score = sim[teamColor].gridContributions[team];
            if (score > bestGridScore) {
                bestGridScore = score;
                bestScorer = team;
            }
        });
        return bestScorer;
    };
    winnerBestScorer = getBestGridScorers(winner.colorName);
    loserBestScorer = getBestGridScorers(loser.colorName);

    return <>
        <SimulatorInsightRow
            label="Strongest Grid Scorer"
            winnerValue={winnerBestScorer}
            winnerColor={winner.color}
            loserValue={loserBestScorer}
            loserColor={loser.color}
            hyperlinkTeams
        />
        <SimulatorInsightRow
            label="Best Autonomous"
            winnerValue={sim[winner.colorName].autoCeiling}
            winnerColor={winner.color}
            loserValue={sim[loser.colorName].autoCeiling}
            loserColor={loser.color}
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