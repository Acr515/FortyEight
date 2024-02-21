import React from "react";
import getTeamName from "data/getTeamName";
import { getOrdinalSuffix } from "util/getOrdinalSuffix";
import "./style.scss";

/**
 * Creates a team card to be used on the playoff helper screen.
 * @param {PlayoffTeam} team The `PlayoffTeam` object to display
 * @param {boolean} isOnTheClock Optional. Whether or not the team is a captain who is currently picking. Defaults to false
 * @param {boolean} captain Optional. Whether or not the team is the captain of their alliance. Defaults to false 
 * @param {boolean} consolidated Optional. Whether to show the full description of a team in a large card or to only show their RPI in a smaller card. Defaults to true
 * @param {Array} partners Optional. Any `PlayoffTeam` instances in this array will render in a single card along with the captain. `isOnTheClock` must be true for this value to have any affect. Defaults to an empty array 
 * @param {boolean} visible Optional. Defaults to true
 */
export default function PlayoffHelperTeam({ team, isOnTheClock = false, captain = false, consolidated = true, partners = [], visible = true }) {

    const teamNumber = team.teamNumber;
    const place = getOrdinalSuffix(team.qualRanking);
    const record = `(${team.getRecord()})`;
    const bestAvailable = false;
    const tempRPIData = "38.2 RPI (1st)";
    const letterGrade = "A-";

    return (
        <div className={`_PlayoffHelperTeam${ isOnTheClock ? " on-the-clock" : "" }${ consolidated ? " consolidated" : "" }${ consolidated && captain ? " captain" : "" }${ !visible ? " hidden" : "" }`}>
            <div className="headline-row">
                <div className="number-record">
                    <div className="inline-entry team-number">{(partners.length == 0 || !isOnTheClock) ? teamNumber : "TODO"}</div>
                    { partners.length == 0 && <div className="inline-entry record">{place} {record}</div> }
                </div>
                { (!isOnTheClock && !consolidated) && <div className="inline-entry grade-info">
                    <div className="letter-grade">{letterGrade}</div>
                    <div className="info-button">i</div>
                </div> }
            </div>
            <div className="label-row">
                <div className="team-name">{ isOnTheClock ? ( partners.length > 0 ? "are on the clock..." : "is on the clock..." ) : getTeamName(teamNumber) }</div>
                { (bestAvailable && !consolidated) && <div className="best-available">Best available</div> }
            </div>
            { consolidated ? <div className="rpi-row">{tempRPIData}</div>
            : 
                <div className="cell-row">
                    <PlayoffHelperTeamCell value={team.rpi.RPI} place={"1st"} label={`RPI (${team.rpi.rating})`} />
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