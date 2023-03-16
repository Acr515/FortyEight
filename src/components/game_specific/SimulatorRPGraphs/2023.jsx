import React from "react";
import SimulatorRPGraphs_Universal from "./_Universal";

/**
 * Displays the pie charts to the right of the RP bar chart describing how often a team wins each extra RP.
 * This won't change much year-to-year, really the main difference is just the variable names.
 * @param {object} sim Simulation results
 * @param {object} winner The winner object
 * @param {object} loser The loser object
 */
export default function SimulatorRPGraphs({ sim, winner, loser }) {
    
    // Chart data
    const winnerGridRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].gridRPRate, 1 - sim[winner.colorName].gridRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Grid RP %",
        value: Math.round(sim[winner.colorName].gridRPRate * 1000) / 10
    };
    const winnerClimbRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].climbRPRate, 1 - sim[winner.colorName].climbRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Climb RP %",
        value: Math.round(sim[winner.colorName].climbRPRate * 1000) / 10
    };
    const loserGridRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].gridRPRate, 1 - sim[loser.colorName].gridRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Grid RP %",
        value: Math.round(sim[loser.colorName].gridRPRate * 1000) / 10
    };
    const loserClimbRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].climbRPRate, 1 - sim[loser.colorName].climbRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Climb RP %",
        value: Math.round(sim[loser.colorName].climbRPRate * 1000) / 10
    };

    // Putting it all together for the universal component
    const graphOptions = {
        winner1: winnerGridRPData,
        winner2: winnerClimbRPData,
        loser1: loserGridRPData,
        loser2: loserClimbRPData
    };

    return <SimulatorRPGraphs_Universal
        graphOptions={graphOptions}
        winner={winner}
        loser={loser}
    />
}