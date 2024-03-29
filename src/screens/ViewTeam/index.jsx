import React, { useState, useContext, useEffect } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import ViewTeamCells from "components/game_specific/ViewTeamCells/GAME_YEAR";
import ViewIndividualData from "components/game_specific/ViewIndividualData/GAME_YEAR";
import EventCodeHolder from "components/EventCodeHolder";
import ImageButton from "components/ImageButton";
import GraphTogglerSet from "components/game_specific/GraphTogglerSet/GAME_YEAR";
import { createDefaultData } from "components/game_specific/GraphTogglerSet/_Universal";
import { BackButton } from "components/PageHeader";
import TeamData from "data/TeamData";
import { saveData } from "data/saveLoadData";
import { findMatchDataByID, getTeamData, getTeamIndex } from "data/SearchData";
import calculateRPI, { calculateSingleRPI, getRPIRating } from "data/game_specific/calculateRPI/GAME_YEAR";
import EditImage from 'assets/images/edit.png';
import XImage from 'assets/images/x.png';
import FlagMisses from 'assets/images/flag-misses.png';
import FlagPenalties from 'assets/images/flag-penalties.png';
import FlagBreakdown from 'assets/images/flag-breakdown.png';
import FeedbackModalContext from 'context/FeedbackModalContext';
import DialogBoxContext from 'context/DialogBoxContext';
import addLeadingZero from 'util/addLeadingZero';
import { Method, sortTeamData } from "util/sortData";
import 'assets/fonts/transandina/index.css';
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
    const backLocation = params.referral ? ("/" + params.referral.replaceAll(".", "/")) : "/teams";
    const backText = params.backtext || "Teams";
    var team = getTeamData(teamNumber);
    if (team == null) return (
        <div className="SCREEN ._ViewTeam">
            <p>That team ({teamNumber}) does not exist in memory.</p>
        </div>
    );
    let data = sortTeamData(getTeamData(teamNumber).data, Method.MatchAscending);


    const [graphIndex, setGraphIndex] = useState(0);                            // numerical index for whichever graph is showing
    const [graphInfo, setGraphInfo] = useState(createDefaultData(teamNumber));  // graph display settings & data
    const [rerender, rerenderPage] = useState(false);
    const [defenseRate, setDefenseRate] = useState(0);

    // Get team defense rate
    useEffect(() => {
        let data = getTeamData(teamNumber).data, defensePlayed = 0;
        data.forEach(match => defensePlayed += match.performance.defense.played);
        setDefenseRate(Math.round(defensePlayed / data.length * 1000) / 10);
    }, []);

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
            x: graphInfo.scaleX,
            y: graphInfo.scaleY
        }
    };
    const chartData = {
        labels: graphInfo.graphLabels,
        datasets: [
            {
                label: graphInfo.scaleY.title.text,   // TODO research how this is used
                data: graphInfo.graphData,
                borderColor: graphInfo.borderColor,
                backgroundColor: graphInfo.backgroundColor,
            }
        ]
    };

    return (
        <div className="SCREEN _ViewTeam">
            <BackButton text={backText} location={backLocation} />
            <div className="column-area">
                <div className="column-section">
                    <h1 className="team-number">{teamNumber}</h1>
                    <h2 className="team-name">{team.name}</h2>

                    <div className="info-cell-holder">
                        <div className="info-cell">
                            <div className="info-value rpi-number">{addLeadingZero(calculateRPI(team).RPI)}</div>
                            <div className="info-label">RPI ({calculateRPI(team).rating})</div>
                        </div>
                        <div className="info-cell">
                            <div className="info-value">{team.data.length}</div>
                            <div className="info-label">Forms</div>
                        </div>
                        <div className="info-cell">
                            <div className="info-value">{defenseRate}%</div>
                            <div className="info-label">Defense Rate</div>
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
                        <GraphTogglerSet
                            activeIndex={graphIndex}
                            stateFuncs={{
                                setGraphIndex: setGraphIndex,
                                setGraphInfo: setGraphInfo
                            }}
                            teamNumber={teamNumber}
                        />
                    </div>
                </div>
            </div>
            <h2>Individual Matches</h2>
            <div className="match-holder">
                {
                    data.map(match =>  { return ( <SingleMatchDisplay 
                        match={match} 
                        forceRenderTeamScreen={{ rerender, rerenderPage }} 
                        key={match.id}
                    /> ) })
                }
            </div>
        </div>
    )
}


export function SingleMatchDisplay({match, forceRenderTeamScreen, showActions = true}) {

    const [expanded, setExpanded] = useState(false);
    const toggleExpansion = () => { setExpanded(!expanded); };

    const modalFunctions = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const navigate = useNavigate();

    const deleteMatch = () => {
        let matchFindObj = findMatchDataByID(match.id)
        if (!matchFindObj) {
            modalFunctions.setModal("That match couldn't be found. Was it already deleted?", true);
        } else {
            if (matchFindObj.dataset.length == 1) {
                // If this is the last match in the dataset, confirm then delete team info
                dialogFunctions.setDialog({ 
                    body: `This is ${match.teamNumber}'s last match form. Deleting it will also remove this team from memory. Would you like to proceed?`,
                    useConfirmation: true,
                    confirmFunction: () => {
                        TeamData.splice(getTeamIndex(match.teamNumber), 1);
                        saveData();
                        modalFunctions.setModal("Successfully deleted a match and its associated team.", false);
                        navigate("/teams");
                    }
                });
            } else {
                matchFindObj.dataset.splice(matchFindObj.index, 1);
                forceRenderTeamScreen.rerenderPage(!forceRenderTeamScreen.rerender);    // jankily update useless state variable to force rerender
                saveData();
                modalFunctions.setModal("Successfully deleted a match.", false);
            }
        }
    }

    return (
        <div className="_MatchData">
            <div className="match-column-area">
                <div className="match-info-column">
                    <div className="match-info-row first">
                        <span className="match-cell-content"><EventCodeHolder eventCode={match.eventCode} /></span>
                    </div>
                    <div className="match-info-row second">
                        <span className="match-cell-content">
                            { showActions && <><ImageButton
                                imageData={XImage}
                                color="black"
                                style={{
                                    width: 16,
                                    height: 16,
                                    display: "inline-block",
                                    marginTop: "auto",
                                    marginBottom: "auto"
                                }}
                                onClick={deleteMatch}
                            />
                            <Link
                                style={{
                                    width: 16,
                                    height: 16,
                                    display: "inline-block",
                                    marginTop: "auto",
                                    marginBottom: "auto",
                                    marginLeft: 8
                                }}
                                to={"/teams/edit/" + match.id}
                            >
                                <ImageButton
                                    imageData={EditImage}
                                    color="black"
                                    style={{
                                        width: 18,
                                        height: 18
                                    }}
                                />
                            </Link></> }
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
                        <span className="match-cell-content">{addLeadingZero(calculateSingleRPI(match))} RPI ({getRPIRating(calculateSingleRPI(match))})</span>
                    </div>
                    <div className="match-info-row second">
                        <span className="match-cell-content">
                            { match.performance.notes.misses && (
                                <ImageButton
                                    imageData={FlagMisses}
                                    color="red"
                                    disabled={true}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        display: "inline-block",
                                        marginTop: "auto",
                                        marginBottom: "auto",
                                        marginLeft: 6
                                    }}
                                />
                            )}
                            { match.performance.notes.broken && (
                                <ImageButton
                                    imageData={FlagBreakdown}
                                    color="red"
                                    disabled={true}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        display: "inline-block",
                                        marginTop: "auto",
                                        marginBottom: "auto",
                                        marginLeft: 6
                                    }}
                                />
                            )}
                            { match.performance.notes.fouls && (
                                <ImageButton
                                    imageData={FlagPenalties}
                                    color="red"
                                    disabled={true}
                                    style={{
                                        width: 22,
                                        height: 22,
                                        display: "inline-block",
                                        marginTop: "auto",
                                        marginBottom: "auto",
                                        marginLeft: 6
                                    }}
                                />
                            )}
                        </span>
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