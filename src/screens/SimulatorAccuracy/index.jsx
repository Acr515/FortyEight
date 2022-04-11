import React, { useState, useContext } from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import FeedbackModalContext from '../../context/FeedbackModalContext';
import Simulator from '../../data/game_specific/Simulator/_Universal';
import TeamData from '../../data/TeamData';
import hitTBA from '../../util/hitTBA';


export default function SimulatorAccuracy() {

    const [eventCode, setEventCode] = useState("");
    const [resultsState, setResultsState] = useState({
        winCorrectRate: -1,
        RP1CorrectRate: -1,
        RP2CorrectRate: -1,
    })
    const modalFunctions = useContext(FeedbackModalContext);

    return (
        <div className="SCREEN _SimulatorAccuracy">
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
                <p>
                    <strong>Wins Correct: </strong>{resultsState.winCorrectRate}
                </p>
                <p>
                    <strong>Cargo RP Correct: </strong>{resultsState.RP1CorrectRate}
                </p>
                <p>
                    <strong>Hangar RP Correct: </strong>{resultsState.RP2CorrectRate}
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
                    RP1: match.score_breakdown.red.cargoBonusRankingPoint,
                    RP2: match.score_breakdown.red.hangarBonusRankingPoint,
                },
                blue: { 
                    RP1: match.score_breakdown.blue.cargoBonusRankingPoint,
                    RP2: match.score_breakdown.blue.hangarBonusRankingPoint,
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
                    500,
                    false,
                    TeamData
                );
                simulator.run(sim => {
                    simulatedResults.push({
                        winner: sim.red.winRate > sim.blue.winRate ? "red" : "blue",
                        number: match.match_number,
                        red: {
                            RP1: sim.red.cargoRPRate > .5,
                            RP2: sim.red.climbRPRate > .5,
                            winRate: sim.red.winRate
                        },
                        blue: {
                            RP1: sim.blue.cargoRPRate > .5,
                            RP2: sim.blue.climbRPRate > .5,
                            winRate: sim.blue.winRate
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
        let winCorrect = 0, RP1Correct = 0, RP2Correct = 0;

        for (let i = 0; i < realResults.length; i ++) {
            let realMatch = realResults[i], simMatch = simulatedResults[i];

            // Compare winners
            if (realMatch.winner == "") {
                // It was a tie; consider the prediction correct if the simulator predicted a close one
                if (simMatch.red.winRate > 45 && simMatch.blue.winRate > 45) winCorrect ++;
            } else if (realMatch.winner == simMatch.winner) winCorrect ++;

            // Compare RPs
            if (realMatch.red.RP1 == simMatch.red.RP1) RP1Correct ++;
            if (realMatch.red.RP2 == simMatch.red.RP2) RP2Correct ++;
            if (realMatch.blue.RP1 == simMatch.blue.RP1) RP1Correct ++;
            if (realMatch.blue.RP2 == simMatch.blue.RP2) RP2Correct ++;
        }

        modalFunctions.setModal("Ready!", false);
        stateUpdate({
            winCorrectRate: winCorrect / realResults.length,
            RP1CorrectRate: RP1Correct / (realResults.length * 2),
            RP2CorrectRate: RP2Correct / (realResults.length * 2),
        })
    }
}