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
    const winnerAutoRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].melodyRPRate, 1 - sim[winner.colorName].melodyRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Melody RP %",
        value: Math.round(sim[winner.colorName].melodyRPRate * 1000) / 10
    };
    const winnerTeleopRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].ensembleRPRate, 1 - sim[winner.colorName].ensembleRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Ensemble RP %",
        value: Math.round(sim[winner.colorName].ensembleRPRate * 1000) / 10
    };
    const loserAutoRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].melodyRPRate, 1 - sim[loser.colorName].melodyRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Melody RP %",
        value: Math.round(sim[loser.colorName].melodyRPRate * 1000) / 10
    };
    const loserTeleopRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].ensembleRPRate, 1 - sim[loser.colorName].ensembleRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Ensemble RP %",
        value: Math.round(sim[loser.colorName].ensembleRPRate * 1000) / 10
    };

    // Putting it all together for the universal component
    const graphOptions = {
        winner1: winnerAutoRPData,
        winner2: winnerTeleopRPData,
        loser1: loserAutoRPData,
        loser2: loserTeleopRPData
    };

    return <SimulatorRPGraphs_Universal
        graphOptions={graphOptions}
        winner={winner}
        loser={loser}
    />
}