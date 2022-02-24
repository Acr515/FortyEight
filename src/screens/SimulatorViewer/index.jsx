import React from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement  } from "chart.js";
import "./style.scss"
import PageHeader from "../../components/PageHeader";
import addLeadingZero from "../../util/addLeadingZero";
import { useLocation } from "react-router-dom";


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

    // Bar chart and smaller doughnut charts
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
                                <span className="number" style={{color: winner.color, fontWeight: 600}}>{winner.teamNumbers[0]}</span>
                                <span className="number" style={{color: loser.color}}>{loser.teamNumbers[0]}</span>
                            </div>
                            <div className="row">
                                <span className="number" style={{color: winner.color, fontWeight: 600}}>{winner.teamNumbers[1]}</span>
                                <span className="number" style={{textAlign: "center"}}>vs</span>
                                <span className="number" style={{color: loser.color}}>{loser.teamNumbers[1]}</span>
                            </div>
                            <div className="row">
                                <span className="number" style={{color: winner.color, fontWeight: 600}}>{winner.teamNumbers[2]}</span>
                                <span className="number" style={{color: loser.color}}>{loser.teamNumbers[2]}</span>
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
                        Other rp stats
                    </div>
                </div>
            </div>


            <div className="simulator-section">
                <h2>Insights</h2>
                <div className="column-section">
                    <div className="column"></div>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}