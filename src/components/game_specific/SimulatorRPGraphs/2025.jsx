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
                data: [sim[winner.colorName].autoRPRate, 1 - sim[winner.colorName].autoRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Auto RP %",
        value: Math.round(sim[winner.colorName].autoRPRate * 1000) / 10
    };
    const winnerCoralRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].coralRPRate, 1 - sim[winner.colorName].coralRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Coral RP %",
        value: Math.round(sim[winner.colorName].coralRPRate * 1000) / 10
    };
    const winnerBargeRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].bargeRPRate, 1 - sim[winner.colorName].bargeRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Barge RP %",
        value: Math.round(sim[winner.colorName].bargeRPRate * 1000) / 10
    };
    const loserAutoRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].autoRPRate, 1 - sim[loser.colorName].autoRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Auto RP %",
        value: Math.round(sim[loser.colorName].autoRPRate * 1000) / 10
    };
    const loserCoralRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].coralRPRate, 1 - sim[loser.colorName].coralRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Coral RP %",
        value: Math.round(sim[loser.colorName].coralRPRate * 1000) / 10
    };
    const loserBargeRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].bargeRPRate, 1 - sim[loser.colorName].bargeRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Barge RP %",
        value: Math.round(sim[loser.colorName].bargeRPRate * 1000) / 10
    };

    // Putting it all together for the universal component
    const graphOptions = {
        winner1: winnerAutoRPData,
        winner2: winnerCoralRPData,
        winner3: winnerBargeRPData,
        loser1: loserAutoRPData,
        loser2: loserCoralRPData,
        loser3: loserBargeRPData
    };

    return <SimulatorRPGraphs_Universal
        graphOptions={graphOptions}
        winner={winner}
        loser={loser}
    />
}