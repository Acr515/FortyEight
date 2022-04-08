import React, { useContext, useState } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement  } from "chart.js";
import "./style.scss"
import PageHeader from "../../components/PageHeader";
import addLeadingZero from "../../util/addLeadingZero";
import { Link, useLocation } from "react-router-dom";
import FeedbackModalContext from "../../context/FeedbackModalContext";
import { shuffle } from "../../util/sortData";
import ScoreCalculator from "../../data/game_specific/ScoreCalculator/2022";
import { EndgameResult } from "../../data/game_specific/performanceObject/2022";
import getTeamName from "../../data/getTeamName";


ChartJS.defaults.font.family = 'transandina';
ChartJS.register(ArcElement);
ChartJS.register(BarElement);

export default function SimulatorViewer() {

    const location = useLocation();

    // Make sure there is data to use
    if (location.state == null/*localStorage.getItem("simulation") == null || localStorage.getItem("simulation") == ""*/) return (
        <div className="SCREEN _SimulatorViewer">
            There is no simulation data in memory. Run a simulation in the Simulator menu.
        </div>
    )

    // Parse simulation data
    var sim = location.state.results//JSON.parse(localStorage.getItem("simulation"));
    const teamSimInfo = (colorString) => { return {
        colorName: colorString.toLowerCase(),
        colorString,
        color: colorString == "Red" ? "#cc3333" : "#3333cc",
        winRate: Math.round((colorString == "Red" ? sim.redWinRate: sim.blueWinRate) * 1000) / 10,
        winRateString: addLeadingZero(Math.round((colorString == "Red" ? sim.redWinRate: sim.blueWinRate) * 1000) / 10) + "%",
        teamNumbers: colorString == "Red" ? sim.redTeamNumbers : sim.blueTeamNumbers,
        rpFreq: colorString == "Red" ? sim.redRPFreq : sim.blueRPFreq,
        stats: sim[colorString.toLowerCase()]
    }}
    
    var absoluteTie = sim.redWinRate == sim.blueWinRate;
    var winner = teamSimInfo(sim.blueWinRate > sim.redWinRate ? "Blue" : "Red");
    var loser = teamSimInfo(sim.redWinRate < sim.blueWinRate ? "Red" : "Blue");


    // Configure charts
    // Big doughnut chart
    var winData = {
        labels: [winner.colorString, loser.colorString, "Tie"],
        datasets: [{
            data: [winner.winRate, loser.winRate, sim.tieRate * 100],
            backgroundColor: [
                winner.color,
                loser.color,
                "#999999"
            ]
        }]
    };
    var winOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%"
    }

    // Bar chart
    var rpData = {
        labels: ["4RP", "3RP", "2RP", "1RP", "0RP"],
        datasets: [
            {
                label: winner.colorString,
                backgroundColor: winner.color,
                data: winner.rpFreq.reverse(),
            },
            {
                label: loser.colorString,
                backgroundColor: loser.color,
                data: loser.rpFreq.reverse(),
            }
        ]
    };
    var rpOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y'
    }

    // Smaller doughnut charts
    var winnerCargoRPData = {
        labels: ["Success", "Failed"],
        datasets: [{
            data: [sim[winner.colorName].cargoRPRate, 1 - sim[winner.colorName].cargoRPRate],
            backgroundColor: [
                winner.color,
                "transparent"
            ]
        }]
    }
    var winnerClimbRPData = {
        labels: ["Success", "Failed"],
        datasets: [{
            data: [sim[winner.colorName].climbRPRate, 1 - sim[winner.colorName].climbRPRate],
            backgroundColor: [
                winner.color,
                "transparent"
            ]
        }]
    }
    var loserCargoRPData = {
        labels: ["Success", "Failed"],
        datasets: [{
            data: [sim[loser.colorName].cargoRPRate, 1 - sim[loser.colorName].cargoRPRate],
            backgroundColor: [
                loser.color,
                "transparent"
            ]
        }]
    }
    var loserClimbRPData = {
        labels: ["Success", "Failed"],
        datasets: [{
            data: [sim[loser.colorName].climbRPRate, 1 - sim[loser.colorName].climbRPRate],
            backgroundColor: [
                loser.color,
                "transparent"
            ]
        }]
    }
    var smallDoughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "80%",
        plugins: { tooltip: {
            enabled: false
        }}
    }

    // Calculate insight data
    // Find best cargo scorers
    const getBestCargoScorers = teamColor => {
        let bestTeleopScore = -100, climbOfBestScorer = EndgameResult.NONE;
        sim[teamColor].bestScorer = -1;
        sim.averageMatch[teamColor].teamPerformances.forEach(team => {
            let score = ScoreCalculator.Teleop.getScore({ performance: team });

            // This line will pick whoever climbs the highest on average if the two best robots score the same # of points
            if (score > bestTeleopScore || (score == bestTeleopScore && ScoreCalculator.Endgame.getScore({ performance: team}) > ScoreCalculator.Endgame.getScoreOfConstant(climbOfBestScorer))) {
                bestTeleopScore = score;
                sim[teamColor].bestScorer = team.teamNumber;
                climbOfBestScorer = team.endgame.state;
            }
        });
    };
    getBestCargoScorers("red");
    getBestCargoScorers("blue");    


    return (
        <div className="SCREEN _SimulatorViewer">
            <PageHeader
                text="Results"
                showBack={true}
                backText="Config"
                location="/analysis/simulator"
            />
            <div className="simulator-section">
                <h2>Summary</h2>
                <div className="column-section">
                    <div className="column">
                        <div className="large-doughnut-container">
                            <Doughnut options={winOptions} data={winData} style={{
                                width: "100%",
                                maxWidth: "300px",
                                height: "300px",
                                margin: "auto",
                            }}/>
                            <div className="doughnut-text">
                                <p className={"winner " + winner.colorName}>{winner.colorString} {winner.winRateString}</p>
                                <p className={loser.colorName}>{loser.colorString} {loser.winRateString}</p>
                                <p className={"tie"}>Tied {Math.round(sim.tieRate * 10000) / 100}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <h2 className={"winner-heading"} style={{
                            color: winner.color
                        }}>{winner.colorString} Alliance</h2>
                        <h3 className={"winner-subheading"} style={{
                            color: winner.color
                        }}>Projected Winner</h3>
                        <div className="team-numbers-summary">
                            <div className="row">
                                <TopLevelTeamNumber isWinner={true} number={winner.teamNumbers[0]} color={winner.color} />
                                <TopLevelTeamNumber isWinner={false} number={loser.teamNumbers[0]} color={loser.color} />
                            </div>
                            <div className="row">
                                <TopLevelTeamNumber isWinner={true} number={winner.teamNumbers[1]} color={winner.color} />
                                <TopLevelTeamNumber isWinner={false} number={loser.teamNumbers[1]} color={loser.color} />
                            </div>
                            <div className="row">
                                <TopLevelTeamNumber isWinner={true} number={winner.teamNumbers[2]} color={winner.color} />
                                <TopLevelTeamNumber isWinner={false} number={loser.teamNumbers[2]} color={loser.color} />
                            </div>
                        </div>
                        <div className="simulation-meta">
                            <p>Generated {sim.timestamp}</p>
                            <p>Simulated {sim.simulations} matches</p>
                            <p>{sim.applyDefense ? "Defense simulated" : "No defense"}</p>
                        </div>
                    </div>
                </div>
            </div>


            <div className="simulator-section">
                <h2>Ranking Points</h2>
                <div className="column-section">
                    <div className="column">
                        <div className="bar-chart-container">
                            <Bar
                                data={rpData}
                                options={rpOptions}
                                style={{
                                    width: "100%",
                                    height: "300px"
                                }}
                            />
                        </div>
                    </div>
                    <div className="column">
                        <div className="doughnuts-container">
                            <div className="doughnut-set">
                                <div className="single-doughnut-container">
                                    <div className="small-doughnut">
                                        <Doughnut data={winnerCargoRPData} options={smallDoughnutOptions} style={{
                                            width: 86,
                                            height: 86
                                        }} />
                                        <span className="percentage" style={{color: winner.color}}>
                                            {Math.round(sim[winner.colorName].cargoRPRate * 1000) / 10}%
                                        </span>
                                    </div>
                                    <p className="label">Cargo RP %</p>
                                </div>
                                <div className="single-doughnut-container">
                                    <div className="small-doughnut">
                                        <Doughnut data={loserCargoRPData} options={smallDoughnutOptions} style={{
                                            width: 86,
                                            height: 86
                                        }} />
                                        <span className="percentage" style={{color: loser.color}}>
                                            {Math.round(sim[loser.colorName].cargoRPRate * 1000) / 10}%
                                        </span>
                                    </div>
                                    <p className="label">Cargo RP %</p>
                                </div>
                            </div>
                            <div className="doughnut-set">
                                <div className="single-doughnut-container">
                                    <div className="small-doughnut">
                                        <Doughnut data={winnerClimbRPData} options={smallDoughnutOptions} style={{
                                            width: 86,
                                            height: 86
                                        }} />
                                        <span className="percentage" style={{color: winner.color}}>
                                            {Math.round(sim[winner.colorName].climbRPRate * 1000) / 10}%
                                        </span>
                                    </div>
                                    <p className="label">Climb RP %</p>
                                </div>
                                <div className="single-doughnut-container">
                                    <div className="small-doughnut">
                                        <Doughnut data={loserClimbRPData} options={smallDoughnutOptions} style={{
                                            width: 86,
                                            height: 86
                                        }} />
                                        <span className="percentage" style={{color: loser.color}}>
                                            {Math.round(sim[loser.colorName].climbRPRate * 1000) / 10}%
                                        </span>
                                    </div>
                                    <p className="label">Climb RP %</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="simulator-section">
                <h2>Insights</h2>
                <div className="column-section">
                    {/*<div className="column">
                        More coming soon!
                    </div>*/}
                    <div className="column">
                        <div className="alliance-insights">
                            <div className="row">
                                <div className="number" style={{color: winner.color}}>{Math.round(winner.stats.scoreRange.avg * 10) / 10}</div>
                                <div className="label">Average Score</div>
                                <div className="number" style={{color: loser.color}}>{Math.round(loser.stats.scoreRange.avg * 10) / 10}</div>
                            </div>
                            <div className="row">
                                <div className="number" style={{color: winner.color}}>{winner.stats.scoreRange.max}/{winner.stats.scoreRange.min}</div>
                                <div className="label">High/Low Score</div>
                                <div className="number" style={{color: loser.color}}>{loser.stats.scoreRange.max}/{loser.stats.scoreRange.min}</div>
                            </div>
                            <div className="row">
                                <div className="number" style={{color: winner.color}}>{Math.round(winner.stats.marginRange.avg * 10) / 10}</div>
                                <div className="label">Average Win Margin</div>
                                <div className="number" style={{color: loser.color}}>{Math.round(loser.stats.marginRange.avg * 10) / 10}</div>
                            </div>
                            <div className="row">
                                <TeamLink className="number" style={{color: winner.color}} number={sim[winner.colorName].bestScorer}>{sim[winner.colorName].bestScorer}</TeamLink>
                                <div className="label">Strongest Cargo Scorer</div>
                                <TeamLink className="number" style={{color: loser.color}} number={sim[loser.colorName].bestScorer}>{sim[loser.colorName].bestScorer}</TeamLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="simulator-section">
                <h2>Matches</h2>
                <MatchViewer sim={sim} />
            </div>
        </div>
    )
}

/**
 * Links any element to its team number
 * @param {number} number The team # 
 */
function TeamLink({children, number, style, className}) {
    return <Link
        to={"/teams/" + number + "/-1/Results"}
        style={style}
        className={className + " team-link"}
    >
        {children}
    </Link>
}

/**
 * Used at the top of the simulator results page to show winning/losing teams and their numbers
 * @param {number} number The team #
 */
function TopLevelTeamNumber({number, color, isWinner}) {
    return <TeamLink
        className="number"
        style={{ color: color, fontWeight: isWinner ? 600 : 400 }}
        number={number}
    >
        {number}
        <span className="team-name">
            {getTeamName(number)}
        </span>
    </TeamLink>;
}

/**
 * Displays data about individual matches, including the unrandomized average match. Manages the state and rendering
 * of itself independent from the screen object
 * @param {object} sim Entire simulation object 
 */
function MatchViewer({sim}) {

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
    }

    const getIndexPool = () => {
        let arr = [];
        for (let i = 0; i < sim.simulations; i ++) { arr.push(i); }
        return arr;
    }

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
    }

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
    }

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
    }

    return (<>
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
    </>)
}