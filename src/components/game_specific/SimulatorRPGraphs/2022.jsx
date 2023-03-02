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
    const winnerCargoRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[winner.colorName].cargoRPRate, 1 - sim[winner.colorName].cargoRPRate],
                backgroundColor: [
                    winner.color,
                    "transparent"
                ]
            }]
        },
        label: "Cargo RP %",
        value: Math.round(sim[winner.colorName].cargoRPRate * 1000) / 10
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
    const loserCargoRPData = {
        chartData: {
            labels: ["Success", "Failed"],
            datasets: [{
                data: [sim[loser.colorName].cargoRPRate, 1 - sim[loser.colorName].cargoRPRate],
                backgroundColor: [
                    loser.color,
                    "transparent"
                ]
            }]
        },
        label: "Cargo RP %",
        value: Math.round(sim[loser.colorName].cargoRPRate * 1000) / 10
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
        winner1: winnerCargoRPData,
        winner2: winnerClimbRPData,
        loser1: loserCargoRPData,
        loser2: loserClimbRPData
    };

    return <SimulatorRPGraphs_Universal
        graphOptions={graphOptions}
        winner={winner}
        loser={loser}
    />
}