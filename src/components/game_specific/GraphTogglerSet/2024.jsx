import React from "react";
import GraphTogglerSet_Universal, { GraphToggler, GraphInfo } from "./_Universal";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2024";
import { getTeamData } from "data/SearchData";
import { Method, sortTeamData } from "util/sortData";

/**
 * A set of buttons used to toggle which performance graph is being shown on a team's details page.
 */
export default function GraphTogglerSet({activeIndex, stateFuncs, teamNumber}) {
    let data = sortTeamData(getTeamData(teamNumber).data, Method.MatchAscending);

    // Calculate notes scored per game
    let piecesLabels = [];
    data.forEach(form => { piecesLabels.push(form.matchNumber); });
    let piecesData = [];
    data.forEach(form => { piecesData.push(ScoreCalculator.Auto.getPieces(form) + ScoreCalculator.Teleop.getPieces(form)); });
    let piecesGraphInfo = new GraphInfo(
        piecesData, piecesLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 12,
            title: { text: "Notes scored" }
        },
        [ 177, 65, 73 ]
    );

    // Calculate auto scores per game
    let autoLabels = [];
    data.forEach(form => { autoLabels.push(form.matchNumber); });
    let autoData = [];
    data.forEach(form => { autoData.push((ScoreCalculator.Auto.getScore(form))); });
    let autocrossGraphInfo = new GraphInfo(
        autoData, autoLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 8,
            ticks: {
                precision: 0
            },
            title: { text: "Auto score" }
        },
        [ 204, 201, 57 ]
    );

    return (
        <>
            <GraphTogglerSet_Universal
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
                teamNumber={teamNumber}
            />
            <GraphToggler
                graphInfo={piecesGraphInfo}
                label="Notes/game"
                index={1}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
            <GraphToggler
                graphInfo={autocrossGraphInfo}
                label="Auto/game"
                index={2}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
        </>
    )
}