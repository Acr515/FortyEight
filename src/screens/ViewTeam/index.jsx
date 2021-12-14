import React from "react";
import { useParams } from "react-router";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from 'chart.js';
import { getTeamData } from "../../data/SearchData";
import calculateRPI, { calculateSingleRPI } from "../../data/game_specific/calculateRPI/202X";
import '../../assets/fonts/transandina/index.css';
import './style.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
);

ChartJS.defaults.font.family = 'transandina';

export default function ViewTeam() {
    // Retrieve team number
    const params = useParams();
    const teamNumber = params.number;
    var team = getTeamData(teamNumber);

    if (team == null) return (
        <div className="SCREEN">
            <p>That team ({teamNumber}) does not exist in memory.</p>
        </div>
    );

    // Sort through data and store it separately
    var data = [];
    team.data.forEach(form => { data.push(form); });
    data.sort((a, b) => {
        if (a.eventCode < b.eventCode) return -1; else if (a.eventCode > b.eventCode) return 1;
        return a.matchNumber < b.matchNumber ? -1 : 1;
    });

    // RPI and label calculation
    var labels = [];
    data.forEach(form => { labels.push(form.matchNumber); });
    var RPIs = [];
    data.forEach(form => { RPIs.push(calculateSingleRPI(form)); });

    // Configure RPI chart
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 2,
        plugins: {
            
        },
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 50,
                title: {
                    display: true,
                    text: "RPI"
                }
            },
            x: {
                title: {
                    display: true,
                    text: "Match #"
                }
            }
        }
    };

    // Collect array of match #s and RPI calculations
    
    const chartData = {
        labels,
        datasets: [
            {
                label: 'RPI',
                data: RPIs,
                borderColor: 'rgb(73, 65, 177)',
                backgroundColor: 'rgba(73, 65, 177, 0.5)',
            }
        ]
      };

    return (
        <div className="SCREEN _ViewTeam">
            <div className="column-area">
                <div className="column-section">
                    <h1 className="team-number">{teamNumber}</h1>
                    <h2>{team.name}</h2>
                    <div className="text-row">
                        <div className="label">Forms</div>
                        <div className="value">{team.data.length}</div>
                    </div>
                    <div className="text-row">
                        <div className="label">Sample field</div>
                        <div className="value">Yes</div>
                    </div>
                </div>
                <div className="column-section">
                    <div className="chart-container">
                        <Line options={chartOptions} data={chartData} style={{
                            width: "100%",
                            height: "100%"
                        }}/>
                    </div>
                    <div className="non-chart-area">
                        <div className="text-row">
                            <div className="label">RPI</div>
                            <div className="value rpi-number">{calculateRPI(team)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}