import React, { useState, useContext } from 'react';
import Button from 'components/Button';
import Input from 'components/Input';
import PageHeader from 'components/PageHeader';
import FeedbackModalContext from 'context/FeedbackModalContext';
import Simulator from 'data/game_specific/Simulator/_Universal';
import TeamData from 'data/TeamData';
import hitTBA from 'util/hitTBA';


export default function SimulatorAccuracy() {

    const [eventCode, setEventCode] = useState("");
    const [resultsState, setResultsState] = useState({
        winCorrectRate: -1,
        RP1CorrectRate: -1,
        RP2CorrectRate: -1,
        RP2Underestimate: -1,
        winPS: 0,
        RP1PS: 0,
        RP2PS: 0
    })
    const modalFunctions = useContext(FeedbackModalContext);

    return (
        <div className="SCREEN _SimulatorAccuracy" style={{ overflowY: "auto" }}>
            <PageHeader text="Simulator Accuracy" />
            <div className="content" style={{ padding: "40px 30px" }}>
                <p>
                    Once an event is over, use this page to determine how well your data was able to predict outcomes. A TBA schedule is downloaded and every match is simulated. This tool will tell you with what % the simulator correctly predicted the winner and ranking point distribution.
                </p>
                <Input
                    label="Event Code"
                    onInput={e => setEventCode(e.target.value)}
                />
                <Button
                    text="Go"
                    marginTop={26}
                    marginBottom={48}
                    action={() => testSimulatorAccuracy(eventCode, modalFunctions, setResultsState)}
                />
                <h2>Results</h2>
                <h3>% Rate Correct</h3>
                <p>
                    <strong>Wins Correct: </strong>{resultsState.winCorrectRate}
                </p>
                <p>
                    <strong>Grid RP Correct: </strong>{resultsState.RP1CorrectRate}
                </p>
                <p>
                    <strong>Charge Station RP Correct: </strong>{resultsState.RP2CorrectRate}
                </p>
                <p>
                    <em>Hangar RP % Won When Guessed No: </em>{resultsState.RP2Underestimate}
                </p>
                <h3 style={{ marginTop: 50 }}>Prediction Scores</h3>
                <p>
                    <strong>Wins: </strong>{resultsState.winPS}
                </p>
                <p>
                    <strong>Grid RP: </strong>{resultsState.RP1PS}
                </p>
                <p>
                    <strong>Charge Station RP: </strong>{resultsState.RP2PS}
                </p>
            </div>
        </div>
    );
}

function testSimulatorAccuracy(eventCode, modalFunctions, stateUpdate) {

    var simulatedResults = [];
    var realResults = [];

    hitTBA("event/" + eventCode + "/matches", matchData => {
        // Iterate through every match and format it to match with the simulation
        matchData.forEach(match => {
            if (match.comp_level == "qm") realResults.push({
                winner: match.winning_alliance,
                number: match.match_number,
                red: { 
                    RP1: match.score_breakdown.red.sustainabilityBonusAchieved,
                    RP2: match.score_breakdown.red.activationBonusAchieved,
                },
                blue: { 
                    RP1: match.score_breakdown.blue.sustainabilityBonusAchieved,
                    RP2: match.score_breakdown.blue.activationBonusAchieved,
                }
            });
        });
        realResults.sort((a, b) => a.number - b.number);

        // Simulate many, many matches lol
        matchData.forEach(match => {
            if (match.comp_level == "qm") {
                let simulator = new Simulator(
                    match.alliances.red.team_keys.map(t => Number(t.substr(3))),
                    match.alliances.blue.team_keys.map(t => Number(t.substr(3))),
                    {
                        simulations: 1000,
                        applyDefense: false,
                        dataset: TeamData
                    }
                );
                simulator.run(sim => {
                    simulatedResults.push({
                        winner: sim.red.winRate > sim.blue.winRate ? "red" : "blue",
                        number: match.match_number,
                        red: {
                            RP1: sim.red.gridRPRate > .5,
                            RP2: sim.red.climbRPRate > .5,
                            winRate: sim.red.winRate,
                            RP1Rate: sim.red.gridRPRate,
                            RP2Rate: sim.red.climbRPRate
                        },
                        blue: {
                            RP1: sim.blue.gridRPRate > .5,
                            RP2: sim.blue.climbRPRate > .5,
                            winRate: sim.blue.winRate,
                            RP1Rate: sim.blue.gridRPRate,
                            RP2Rate: sim.blue.climbRPRate
                        }
                    });
                    console.log("Completed match #" + match.match_number);
                    if (simulatedResults.length >= realResults.length) finalizePredictions();
                });
            }
        })
    }, () => {
        modalFunctions.setModal("Could not reach TBA.", true);
    });

    function finalizePredictions() {
        // Ensure that simulated array is sorted
        simulatedResults.sort((a, b) => a.number - b.number);
        let winCorrect = 0, RP1Correct = 0, RP2Correct = 0, RP2Underestimate = 0;
        let winPS = 0, RP1PS = 0, RP2PS = 0;    // Prediction Scores: increase and decrease based on the model's confidence in certain outcomes being right/wrong. Based on algorithm by FiveThirtyEight

        const getPredictionPoints = percent => {
            return 25 - (Math.pow((percent * 100) - 100, 2) / 100)
        }

        // Iterate through all results
        for (let i = 0; i < realResults.length; i ++) {
            let realMatch = realResults[i], simMatch = simulatedResults[i];

            // Compare winners
            if (realMatch.winner == "") {
                // It was a tie; consider the prediction correct if the simulator predicted a close one
                if (simMatch.red.winRate > 45 && simMatch.blue.winRate > 45) winCorrect ++;
            } else if (realMatch.winner == simMatch.winner) {
                // Simulator chose correctly
                winCorrect ++;
                winPS += getPredictionPoints(simMatch[simMatch.winner].winRate);
            } else {
                // Simulator chose incorrectly
                winPS += getPredictionPoints(simMatch[(simMatch.winner == "red" ? "blue" : "red")].winRate);
            }

            // Compare RPs
            const compareRP = color => {
                if (realMatch[color].RP1 == simMatch[color].RP1) {
                    // Was correct about RP1
                    RP1Correct ++;
                }
                if (realMatch[color].RP1) RP1PS += getPredictionPoints(simMatch[color].RP1Rate); else RP1PS += getPredictionPoints(1 - simMatch[color].RP1Rate);
                
                if (realMatch[color].RP2 == simMatch[color].RP2) {
                    // Was correct about RP2
                    RP2Correct ++;
                } else if (realMatch[color].RP2 && !simMatch[color].RP2) RP2Underestimate ++;
                if (realMatch[color].RP2) RP2PS += getPredictionPoints(simMatch[color].RP2Rate); else RP2PS += getPredictionPoints(1 - simMatch[color].RP2Rate);
            }
            compareRP("red");
            compareRP("blue");
        }

        modalFunctions.setModal("Ready!", false);
        stateUpdate({
            winCorrectRate: winCorrect / realResults.length,
            RP1CorrectRate: RP1Correct / (realResults.length * 2),
            RP2CorrectRate: RP2Correct / (realResults.length * 2),
            RP2Underestimate: RP2Underestimate / (realResults.length * 2 - RP2Correct),
            winPS,
            RP1PS: RP1PS / 2,
            RP2PS: RP2PS / 2
        });
    }
}