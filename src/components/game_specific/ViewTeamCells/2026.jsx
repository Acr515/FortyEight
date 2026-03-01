import React from "react";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2026";

/**
 * @typedef {Object} PhaseAverage Phase-agnostic set of attributes for measuring averages across a set of matches.
 * @property {number} cycles Average number of cycles scored during phase.
 * @property {number} accuracy Average accuracy during phase.
 * @property {number} fuel Average fuel scored during phase.
 * @property {number} fuelPerCycle Average fuel scored per cycle.
 */

export default function ViewTeamCells({team}) {
    // Accumulate match averages

    const calculateAverages = (phase) => {
        /** @type {PhaseAverage} */
        const average = {
            cycles: 0,
            accuracy: 0,
            fuel: 0,
            fuelPerCycle: 0,
        };

        for (const match of team.data) {
            average.cycles += match.performance[phase].cycles;
            average.accuracy += match.performance[phase].accuracy * match.performance[phase].fuel;
            average.fuel += match.performance[phase].fuel;
        }

        average.accuracy = Math.round(average.accuracy / average.fuel * 10) / 10;
        average.fuel = Math.round(average.fuel / team.data.length * 10) / 10;
        average.cycles = Math.round(average.cycles / team.data.length * 10) / 10;
        average.fuelPerCycle = Math.round(average.fuel / average.cycles * 10) / 10;

        return average;
    }

    const auto = calculateAverages('auto');
    const teleop = calculateAverages('teleop');

    // Calculate climb rates
    let climbFails = 0, climbs = 0, autoClimbs = 0;
    for (const match of team.data) {
        autoClimbs += match.performance.auto.state;
        climbs += ScoreCalculator.Endgame.didClimb(match);
        climbFails += match.performance.endgame.failedAttempt;
    }

    return (
        <>
            <div className="info-cell">
                <div className="info-value">{teleop.cycles}</div>
                <div className="info-label">Avg. Teleop Cycles</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{teleop.fuelPerCycle}</div>
                <div className="info-label">Teleop Fuel/Cycle</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{teleop.accuracy}</div>
                <div className="info-label">Teleop Accuracy</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{auto.cycles}</div>
                <div className="info-label">Avg. Auto Cycles</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{auto.fuelPerCycle}</div>
                <div className="info-label">Auto Fuel/Cycle</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{auto.accuracy}</div>
                <div className="info-label">Auto Accuracy</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{autoClimbs}/{team.data.length}</div>
                <div className="info-label">Auto Climbs</div>
            </div>
            <div className="info-cell">
                <div className="info-value">{climbs}/{climbs + climbFails}</div>
                <div className="info-label">Climb Success</div>
            </div>
        </>
    )
}