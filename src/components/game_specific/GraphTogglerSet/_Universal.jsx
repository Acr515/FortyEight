import React from "react";
import { getTeamData } from "data/SearchData";
import { Method, sortTeamData } from "util/sortData";
import { calculateSingleRPI } from "data/game_specific/calculateRPI/GAME_YEAR";
import "./style.scss"

/**
 * A button to be displayed beneath the chart on the ViewTeam screen.
 * @param {GraphInfo} graphInfo a `GraphInfo` instance containing relevant information to this graph mode
 * @param {string} label the text to write on the button itself 
 * @param {number} index the index # assigned to this button 
 * @param {number} activeIndex the currently selected graph (used for visually distinguishing the buttons based on what is selected)  
 * @param {object} stateFuncs contains the functions for manipulating the graph
 */
export function GraphToggler({graphInfo, label, index, activeIndex, stateFuncs}) {
    const clickListener = () => {
        stateFuncs.setGraphIndex(index);
        stateFuncs.setGraphInfo(graphInfo);
    }
    return (
        <button
            className="_GraphToggler"
            onClick={clickListener}
            style={{ backgroundColor: graphInfo.backgroundColor, borderColor: graphInfo.borderColor }}
        >
            {label}
        </button>
    )
}

/**
 * Holds data to be consumed by ViewTeam's graph. Constructor is as follows:
 * * `graphData` which holds an array of numbers to be charted
 * * `graphLabels` which holds an array of strings to use as the x-axis labels
 * * `scaleX` corresponds to `options.scale.x` in the chart's `options` object- see docs https://www.chartjs.org/docs/latest/general/options.html
 * * `scaleY` see above
 * * `color` which should be an array of the RGB colors desired for the points on the graph `[r, g, b]`
 */
export class GraphInfo {
    constructor(graphData, graphLabels, scaleX, scaleY, color) {
        this.graphData = graphData;
        this.graphLabels = graphLabels;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        scaleX.title.display = true;
        scaleY.title.display = true;
        this.borderColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        this.backgroundColor = `rgba(${color[0]}, ${color[1]}, ${color[2]}, .5)`;
    }
}

/**
 * A source for any ViewTeam graph setting that should always be available, i.e. RPI/match. Should be fed
 * `activeIndex`, `stateFuncs`, and `teamNumber`
 */
export default function GraphTogglerSet_Universal({activeIndex, stateFuncs, teamNumber}) {
    let graphInfo = createDefaultData(teamNumber);
    return (
        <>
            <GraphToggler
                graphInfo={graphInfo}
                label="RPI/match"
                index={0}
                activeIndex={activeIndex}
                stateFuncs={stateFuncs}
            />
        </>
    )
}

/**
 * This function creates the data that should prepopulate the chart when the ViewTeam screen is opened. This data
 * is the team's RPI per match, and that object is returned.
 * @param {Number} teamNumber the team's number
 * @returns an instance of GraphInfo
 */
export function createDefaultData(teamNumber) {
    // Generate the data for RPI per match
    let data = sortTeamData(getTeamData(teamNumber).data, Method.MatchAscending);
    let labels = [];
    data.forEach(form => { labels.push(form.matchNumber); });
    let RPIs = [];
    data.forEach(form => { RPIs.push(calculateSingleRPI(form)); });

    // Create GraphInfo instance
    let graphInfo = new GraphInfo(
        RPIs,
        labels,
        {
            title: { text: "Match #" }
        },
        {
            suggestedMin: 0,
            suggestedMax: 50,
            title: { text: "RPI" }
        },
        [ 73, 65, 177 ]
    );

    return graphInfo;
}