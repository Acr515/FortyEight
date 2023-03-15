import React, { useState, useContext } from "react";
import FeedbackModalContext from "context/FeedbackModalContext";
import './style.scss';

/**
 * Displays data about individual matches, including the unrandomized average match. Manages the state and rendering
 * of itself independent from the screen object
 * @param {object} sim Entire simulation object 
 */
export default function SimulatorMatchViewer_Universal({sim}) {

    const [match, setMatch] = useState(sim.averageMatch);
    const [matchIndex, setMatchIndex] = useState(-1);
    const modalFunctions = useContext(FeedbackModalContext);

    const displayMatch = (ind, sim) => {
        if (ind == -1) {
            setMatch(sim.averageMatch); 
            setMatchIndex(-1);
        } else {
            setMatch(sim.data[ind]);
            setMatchIndex(ind);
        }
    };

    const getMatchRedWinner = (sim) => {
        let startIndex = matchIndex, currentIndex = matchIndex + 1;
        while (startIndex != currentIndex) {
            if (sim.data[currentIndex].red.score > sim.data[currentIndex].blue.score) {
                displayMatch(currentIndex, sim);
                return;
            }
            currentIndex = (currentIndex >= sim.data.length - 1 ? 0 : currentIndex + 1);
        }
        modalFunctions.setModal("There were no matches that fit your criteria.", true);
    };

    const getMatchBlueWinner = (sim) => {
        let startIndex = matchIndex, currentIndex = matchIndex + 1;
        while (startIndex != currentIndex) {
            if (sim.data[currentIndex].blue.score > sim.data[currentIndex].red.score) {
                displayMatch(currentIndex, sim);
                return;
            }
            currentIndex = (currentIndex >= sim.data.length - 1 ? 0 : currentIndex + 1);
        }
        modalFunctions.setModal("There were no matches that fit your criteria.", true);
    };

    const getMatchTie = (sim) => {
        let startIndex = matchIndex, currentIndex = matchIndex + 1;
        while (startIndex != currentIndex) {
            if (sim.data[currentIndex].red.score == sim.data[currentIndex].blue.score) {
                displayMatch(currentIndex, sim);
                return;
            }
            currentIndex = (currentIndex >= sim.data.length - 1 ? 0 : currentIndex + 1);
        }
        modalFunctions.setModal("There were no matches that fit your criteria.", true);
    };

    return <>
        <div className="match-navigator-bar">
            <a onClick={() => displayMatch(-1, sim)}>Most Likely</a>
            <a onClick={() => getMatchRedWinner(sim)}>Any Red Win</a>
            <a onClick={() => getMatchBlueWinner(sim)}>Any Blue Win</a>
            <a onClick={() => getMatchTie(sim)}>Any Tie</a>
        </div>
        <h3 className="match-navigator-current">
            {matchIndex == -1 ? "Most Likely Result" : "Match # " + (matchIndex + 1)}
        </h3>
        <div className="column-section">
            <div className="column">
                <div className="alliance-match-result red">
                    <div className="teams-score-row">
                        <div className="teams">
                            <span className="number">{match.red.teamPerformances[0].teamNumber}</span>
                            <span className="number">{match.red.teamPerformances[1].teamNumber}</span>
                            <span className="number">{match.red.teamPerformances[2].teamNumber}</span>
                        </div>
                        <div className="score">
                            <div className="number">{match.red.score}</div>
                            {match.red.score >= match.blue.score && (
                                <div className="win-label">{match.red.score == match.blue.score ? "TIE" : "WIN"}</div>
                            )}
                        </div>
                    </div>
                    <div className="rp-scores-row">
                        <div className="rps">
                            <div className="total-rp">{match.red.matchRP + (match.red.cargoRP ? 1 : 0) + (match.red.climbRP ? 1 : 0)} RP</div>
                            <div className={"rp-cell" + (match.red.cargoRP ? " win" : "")}>CARGO</div>
                            <div className={"rp-cell" + (match.red.climbRP ? " win" : "")}>HANGAR</div>
                            <div className={"rp-cell" + (match.red.matchRP > 0 ? " win" : "")}>{match.red.score == match.blue.score ? "TIE" : "WIN"}</div>
                        </div>
                        <div className="scores">
                            <div className="row"><div className="label">AUTO</div><div className="score">{match.red.autoScore}</div></div>
                            <div className="row"><div className="label">TELEOP</div><div className="score">{match.red.teleopScore}</div></div>
                            <div className="row"><div className="label">HANGAR</div><div className="score">{match.red.endgameScore}</div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="column">
                <div className="alliance-match-result blue">
                    <div className="teams-score-row">
                        <div className="score">
                            <div className="number">{match.blue.score}</div>
                            {match.blue.score >= match.red.score && (
                                <div className="win-label">{match.blue.score == match.red.score ? "TIE" : "WIN"}</div>
                            )}
                        </div>
                        <div className="teams">
                            <span className="number">{match.blue.teamPerformances[0].teamNumber}</span>
                            <span className="number">{match.blue.teamPerformances[1].teamNumber}</span>
                            <span className="number">{match.blue.teamPerformances[2].teamNumber}</span>
                        </div>
                    </div>
                    
                    <div className="rp-scores-row">
                        <div className="scores">
                            <div className="row"><div className="score">{match.blue.autoScore}</div><div className="label">AUTO</div></div>
                            <div className="row"><div className="score">{match.blue.teleopScore}</div><div className="label">TELEOP</div></div>
                            <div className="row"><div className="score">{match.blue.endgameScore}</div><div className="label">HANGAR</div></div>
                        </div>
                        <div className="rps">
                            <div className="total-rp">{match.blue.matchRP + (match.blue.cargoRP ? 1 : 0) + (match.blue.climbRP ? 1 : 0)} RP</div>
                            <div className={"rp-cell" + (match.blue.cargoRP ? " win" : "")}>CARGO</div>
                            <div className={"rp-cell" + (match.blue.climbRP ? " win" : "")}>HANGAR</div>
                            <div className={"rp-cell" + (match.blue.matchRP > 0 ? " win" : "")}>{match.red.score == match.blue.score ? "TIE" : "WIN"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}