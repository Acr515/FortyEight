import React, { useState } from "react";
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
import ViewTeamCells from "../../components/game_specific/ViewTeamCells/202X";
import ViewIndividualData from "../../components/game_specific/ViewIndividualData/202X";
import EventCodeHolder from "../../components/EventCodeHolder";
import ImageButton from "../../components/ImageButton";
import EditImage from '../../assets/images/edit.png';
import XImage from '../../assets/images/x.png';
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
        <div className="SCREEN ._ViewTeam">
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
        plugins: {},
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
                    <h2 className="team-name">{team.name}</h2>

                    <div className="info-cell-holder">
                        <div className="info-cell">
                            <div className="info-value rpi-number">{calculateRPI(team)}</div>
                            <div className="info-label">RPI</div>
                        </div>
                        <div className="info-cell">
                            <div className="info-value">{team.data.length}</div>
                            <div className="info-label">Forms</div>
                        </div>
                        <div className="info-cell">
                            <div className="info-value">--%</div>
                            <div className="info-label">Defense Rate</div>
                        </div>
                        <div className="info-cell">
                            <div className="info-value">-/-</div>
                            <div className="info-label">Climbs</div>
                        </div>
                        <ViewTeamCells team={team}/>
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
                        
                    </div>
                </div>
            </div>
            <h2>Individual Matches</h2>
            <div className="match-holder">
                {
                    data.map(match =>  { return ( <MatchData match={match} /> ) })
                }
            </div>
        </div>
    )
}

function MatchData({match}) {

    const [expanded, setExpanded] = useState(false);
    const toggleExpansion = () => { setExpanded(!expanded); };

    return (
        <div className="_MatchData">
            <div className="match-column-area">
                <div className="match-info-column">
                    <div className="match-info-row first">
                        <span className="match-cell-content"><EventCodeHolder eventCode={match.eventCode} /></span>
                    </div>
                    <div className="match-info-row second">
                        <span className="match-cell-content">
                            
                            <ImageButton
                                imageData={XImage}
                                color="black"
                                style={{
                                    width: 16,
                                    height: 16,
                                    display: "inline-block",
                                    marginTop: "auto",
                                    marginBottom: "auto"
                                }}
                            />
                            <ImageButton
                                imageData={EditImage}
                                color="black"
                                style={{
                                    width: 16,
                                    height: 16,
                                    display: "inline-block",
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                    marginLeft: 8
                                }}
                            />
                        </span>
                    </div>
                    <div className="match-info-row third">
                        <span className="match-cell-content">{match.id}</span>
                    </div>
                </div>
                <div className="match-info-column">
                    <div className="match-info-row first">
                        <span className="match-cell-content">Match #{match.matchNumber}</span>
                    </div>
                    <div className="match-info-row second">
                        <span className="match-cell-content">{match.name}</span>
                    </div>
                    <div className="match-info-row third">
                        <span className="match-cell-content">{match.timestamp}</span>
                    </div>
                </div>
                <div className="match-info-column third">
                    <div className="match-info-row first">
                        <span className="match-cell-content">RPI: {calculateSingleRPI(match)}</span>
                    </div>
                    <div className="match-info-row second">
                        <span className="match-cell-content"></span>
                    </div>
                    <div className="match-info-row third">
                        <span 
                            className="match-cell-content see-more"
                            onClick={toggleExpansion}
                        >
                            See {expanded ? "less" : "more"}
                        </span>
                    </div>
                </div>
            </div>

            <div className={"match-details" + (expanded ? "" : " hidden-area")}>
                <h3>Match Details</h3>
                <ViewIndividualData data={match} />
            </div>
        </div>
    )
}