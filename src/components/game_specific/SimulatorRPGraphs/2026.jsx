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
    const winnerEnergizedRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].energizedRPRate, 1 - sim[winner.colorName].energizedRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Energized RP %",
        value: Math.round(sim[winner.colorName].energizedRPRate * 1000) / 10
    };
    const winnerSuperchargedRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].superchargedRPRate, 1 - sim[winner.colorName].superchargedRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Supercharged RP %",
        value: Math.round(sim[winner.colorName].superchargedRPRate * 1000) / 10
    };
    const winnerTraversalRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].traversalRPRate, 1 - sim[winner.colorName].traversalRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Traversal RP %",
        value: Math.round(sim[winner.colorName].traversalRPRate * 1000) / 10
    };
    const loserEnergizedRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].energizedRPRate, 1 - sim[loser.colorName].energizedRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Energized RP %",
        value: Math.round(sim[loser.colorName].energizedRPRate * 1000) / 10
    };
    const loserSuperchargedRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].superchargedRPRate, 1 - sim[loser.colorName].superchargedRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Supercharged RP %",
        value: Math.round(sim[loser.colorName].superchargedRPRate * 1000) / 10
    };
    const loserTraversalRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].traversalRPRate, 1 - sim[loser.colorName].traversalRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Traversal RP %",
        value: Math.round(sim[loser.colorName].traversalRPRate * 1000) / 10
    };

    // Putting it all together for the universal component
    const graphOptions = {
        winner1: winnerEnergizedRPData,
        winner2: winnerSuperchargedRPData,
        winner3: winnerTraversalRPData,
        loser1: loserEnergizedRPData,
        loser2: loserSuperchargedRPData,
        loser3: loserTraversalRPData
    };

    return <SimulatorRPGraphs_Universal
        graphOptions={graphOptions}
        winner={winner}
        loser={loser}
    />
}