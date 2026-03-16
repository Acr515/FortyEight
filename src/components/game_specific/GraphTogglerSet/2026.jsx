import React from "react";
import GraphTogglerSet_Universal, { GraphToggler, GraphInfo } from "./_Universal";
import { getTeamData } from "data/SearchData";
import { Method, sortTeamData } from "util/sortData";

/**
 * A set of buttons used to toggle which performance graph is being shown on a team's details page.
 */
export default function GraphTogglerSet({activeIndex, stateFuncs, teamNumber}) {
    let data = sortTeamData(getTeamData(teamNumber).data, Method.MatchAscending);
    let matchLabels = data.map(form => form.matchNumber);

    // Calculate cycles per game
    let cycleData = data.map(({ performance }) => performance.auto.cycles + performance.teleop.cycles);
    let cycleGraphInfo = new GraphInfo(
        cycleData, matchLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 12,
            title: { text: "Cycles" }
        },
        [ 177, 65, 73 ]
    );

    // Calculate fuel per cycle per game
    let fuelData = data.map(({ performance }) => performance.auto.fuel + performance.teleop.fuel);
    let fuelGraphInfo = new GraphInfo(
        cycleData, matchLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 32,
            title: { text: "Fuel" }
        },
        [ 72, 184, 133 ]
    );

    // Calculate accuracy per game
    let accuracyData = data.map(({ performance }) => performance.teleop.accuracy);
    let accuracyGraphInfo = new GraphInfo(
        cycleData, matchLabels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 100,
            title: { text: "Accuracy (%)" }
        },
        [ 51, 128, 204 ]
    );

    return (
        <>
            <GraphTogglerSet_Universal
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
                teamNumber={teamNumber}
            />
            <GraphToggler
                graphInfo={cycleGraphInfo}
                label="Cycles/game"
                index={1}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
            <GraphToggler
                graphInfo={fuelGraphInfo}
                label="Fuel/cycle"
                index={2}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
            <GraphToggler
                graphInfo={accuracyGraphInfo}
                label="Accuracy/game"
                index={3}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
        </>
    )
}