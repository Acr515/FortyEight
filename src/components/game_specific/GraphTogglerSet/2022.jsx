import React from "react";
import ScoreCalculator from "../../../data/game_specific/ScoreCalculator/2022";
import GraphTogglerSet_Universal, { GraphToggler, GraphInfo } from "./_Universal";
import { Method, sortTeamData } from "../../../util/sortData";
import { getTeamData } from "../../../data/SearchData";

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

    // Get endgame status per game
    let endgameLabels = [];
    data.forEach(form => { endgameLabels.push(form.matchNumber); });
    let endgameData = [];
    data.forEach(form => { endgameData.push(ScoreCalculator.Endgame.getNumericalLevel(form)); });
    let endgameGraphInfo = new GraphInfo(
        endgameData, endgameLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 4,
            ticks: {
                precision: 0
            },
            title: { text: "Endgame Level" }
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
                graphInfo={endgameGraphInfo}
                label="Endgame/game"
                index={2}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
        </>
    )
}