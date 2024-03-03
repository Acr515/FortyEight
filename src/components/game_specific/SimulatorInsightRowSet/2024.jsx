import React from "react";
import SimulatorInsightRow from "components/SimulatorInsightRow";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2024";

export default function SimulatorInsightRowSet({sim, winner, loser}) {
    
    // Find best game piece scorers
    let winnerBestScorer = -1, loserBestScorer = -1;
    const getBestNoteScorers = teamColor => {
        let bestNotesScored = -100;
        let bestScorer = -1;
        sim.averageMatch[teamColor].teamPerformances.forEach(team => {
            let score = ScoreCalculator.Teleop.getPieces({ performance: team });
            if (score > bestNotesScored) {
                bestNotesScored = score;
                bestScorer = team.teamNumber;
            }
        });
        return bestScorer;
    };

    winnerBestScorer = getBestNoteScorers(winner.colorName);
    loserBestScorer = getBestNoteScorers(loser.colorName);

    // Get favored scoring location
    let winnerSpeakerRate = Math.round(sim[winner.colorName].speakerNoteRate * 1000) / 10;
    let winnerFavoredLocation = "Speaker";
    if (winnerSpeakerRate < 50) {
        winnerFavoredLocation = "Amp";
        winnerSpeakerRate = 100 - winnerSpeakerRate;
    }

    let loserSpeakerRate = Math.round(sim[loser.colorName].speakerNoteRate * 1000) / 10;
    let loserFavoredLocation = "Speaker";
    if (loserSpeakerRate < 50) {
        loserFavoredLocation = "Amp";
        loserSpeakerRate = 100 - loserSpeakerRate;
    }

    return <>
        <SimulatorInsightRow
            label="Strongest Note Scorer"
            winnerValue={winnerBestScorer}
            winnerColor={winner.color}
            loserValue={loserBestScorer}
            loserColor={loser.color}
            hyperlinkTeams
        />
        <SimulatorInsightRow
            label="Average Notes / Game"
            winnerValue={Math.round(sim[winner.colorName].averageNotes * 100) / 100}
            winnerColor={winner.color}
            loserValue={Math.round(sim[loser.colorName].averageNotes * 100) / 100}
            loserColor={loser.color}
        />
        <SimulatorInsightRow
            label="Favored Note Location"
            winnerValue={`${winnerFavoredLocation} (${winnerSpeakerRate}%)`}
            winnerColor={winner.color}
            loserValue={`${loserFavoredLocation} (${loserSpeakerRate}%)`}
            loserColor={loser.color}
        />
        <SimulatorInsightRow
            label="Avg. Notes Stopped by Defense"
            winnerValue={sim[winner.colorName].defenseOccurrences > 0 ? Math.round(sim[winner.colorName].defenseNotesPrevented * 100 / 100) : "---"}
            winnerColor={winner.color}
            loserValue={sim[loser.colorName].defenseOccurrences > 0 ? Math.round(sim[loser.colorName].defenseNotesPrevented * 100 / 100) : "---"}
            loserColor={loser.color}
        />
    </>
}