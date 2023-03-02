import React from "react";
import GraphTogglerSet_Universal, { GraphToggler, GraphInfo } from "./_Universal";
import ScoreCalculator from "data/game_specific/ScoreCalculator/202X";
import { getTeamData } from "data/SearchData";
import { Method, sortTeamData } from "util/sortData";

/**
 * A set of buttons used to toggle which performance graph is being shown on a team's details page.
 */
export default function GraphTogglerSet({activeIndex, stateFuncs, teamNumber}) {
    let data = sortTeamData(getTeamData(teamNumber).data, Method.MatchAscending);

    // Calculate game pieces scored per game
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
            title: { text: "Pieces scored" }
        },
        [ 177, 65, 73 ]
    );

    // Get auto cross status per game
    let autocrossLabels = [];
    data.forEach(form => { autocrossLabels.push(form.matchNumber); });
    let autocrossData = [];
    data.forEach(form => { autocrossData.push((form.performance.auto.cross)); });
    let autocrossGraphInfo = new GraphInfo(
        autocrossData, autocrossLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 4,
            ticks: {
                precision: 0
            },
            title: { text: "Autocross" }
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
                label="Pieces/game"
                index={1}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
            <GraphToggler
                graphInfo={autocrossGraphInfo}
                label="Autocross/game"
                index={2}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
        </>
    )
}