import React from "react";
import "./style.scss";
import getTeamName from "data/getTeamName";

/**
 * Creates a team card to be used on the playoff helper screen.
 * @param {*} param0 
 */
export default function PlayoffHelperTeam({ team }) {

    const teamNumber = 4855;
    const place = "1st";
    const record = "(10-2)";
    const isOnTheClock = false;
    const partners = false;
    const bestAvailable = false;
    const consolidated = false;
    const captain = false;
    const tempRPIData = "38.2 RPI (1st)";
    const letterGrade = "A-";

    return (
        <div className={`_PlayoffHelperTeam${ isOnTheClock ? " on-the-clock" : "" }${ consolidated ? " consolidated" : "" }${ consolidated && captain ? " captain" : "" }`}>
            <div className="headline-row">
                <div className="number-record">
                    <div className="inline-entry team-number">{teamNumber}</div>
                    { !partners && <div className="inline-entry record">{place} {record}</div> }
                </div>
                { !isOnTheClock && <div className="inline-entry grade-info">
                    <div className="letter-grade">{letterGrade}</div>
                    <div className="info-button">i</div>
                </div> }
            </div>
            <div className="label-row">
                <div className="team-name">{ isOnTheClock ? ( partners ? "are on the clock..." : "is on the clock..." ) : getTeamName(teamNumber) }</div>
                { (bestAvailable && !consolidated) && <div className="best-available">Best available</div> }
            </div>
            { consolidated ? <div className="rpi-row">{tempRPIData}</div>
            : 
                <div className="cell-row">
                    <PlayoffHelperTeamCell value={38.2} place={"1st"} label={"RPI (Excellent)"} />
                    <PlayoffHelperTeamCell value={12.5} place={"2nd"} label={"Autonomous"} />
                    <PlayoffHelperTeamCell value={5.2} place={"14th"} label={"Amp Scoring"} />
                    <PlayoffHelperTeamCell value={8.3} place={"4th"} label={"Speaker Scoring"} />
                </div>
            }
        </div>
    )
}

function PlayoffHelperTeamCell({ value, place, label }) {
    return (
        <div className="_PlayoffHelperTeamCell">
            <div className="value-holder">
                <div className="inline-entry value">{value}</div>
                <div className="inline-entry place">{place}</div>
            </div>
            <div className="label">{label}</div>
        </div>
    )
}