import React from "react";
import PlayoffHelperTeamCell from "./_Universal";
import { getOrdinalSuffix } from "util/getOrdinalSuffix";

/**
 * Renders a game-specific set of cells to be populated under every team who is a candidate to be picked.
 * @param {PlayoffTeam} team The team who the cells belong to
 */
export default function PlayoffHelperTeamCellSet({ team }) { 

    const defenseScore = team.powerScores.WellRounded.Defense == 0 ? "--" : team.powerScores.WellRounded.Defense;
    const defenseRanking = team.powerScores.WellRounded.Defense == 0 ? "" : getOrdinalSuffix(team.powerScoreRankings.Defense);

    return (
        <>
            <PlayoffHelperTeamCell value={team.rpi.RPI} place={getOrdinalSuffix(team.rpi.ranking)} label={`RPI (${team.rpi.rating})`} />
            <PlayoffHelperTeamCell value={team.powerScores.WellRounded.Autonomous} place={getOrdinalSuffix(team.powerScoreRankings.Autonomous)} label={"Autonomous"} />
            <PlayoffHelperTeamCell value={team.powerScores.WellRounded.Speaker} place={getOrdinalSuffix(team.powerScoreRankings.Speaker)} label={"Speaker Scoring"} />
            <PlayoffHelperTeamCell value={team.powerScores.WellRounded.Amp} place={getOrdinalSuffix(team.powerScoreRankings.Amp)} label={"Amp Scoring"} />
            <PlayoffHelperTeamCell value={team.powerScores.WellRounded.Endgame} place={getOrdinalSuffix(team.powerScoreRankings.Endgame)} label={"Endgame"} />
            <PlayoffHelperTeamCell value={defenseScore} place={defenseRanking} label={"Defense"} />
        </>
    )
}