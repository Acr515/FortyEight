import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement  } from "chart.js";
import "./style.scss"
import PageHeader from "../../components/PageHeader";
import addLeadingZero from "../../util/addLeadingZero";


ChartJS.defaults.font.family = 'transandina';
ChartJS.register(ArcElement);

export default function SimulatorViewer() {

    // Make sure there is data to use
    if (localStorage.getItem("simulation") == null || localStorage.getItem("simulation") == "") return (
        <div className="SCREEN _SimulatorViewer">
            There is no simulation data in memory. Run a simulation in the Simulator menu.
        </div>
    )

    // Parse simulation data
    var sim = JSON.parse(localStorage.getItem("simulation"));
    const teamSimInfo = (colorString) => { return {
        colorName: colorString.toLowerCase(),
        colorString,
        color: colorString == "Red" ? "#cc3333" : "#3333cc",
        winRate: Math.round((colorString == "Red" ? sim.redWinRate: sim.blueWinRate) * 1000) / 10,
        winRateString: addLeadingZero(Math.round((colorString == "Red" ? sim.redWinRate: sim.blueWinRate) * 1000) / 10) + "%",
        teamNumbers: colorString == "Red" ? sim.redTeamNumbers : sim.blueTeamNumbers,
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
            </div>
        </div>
    )
}