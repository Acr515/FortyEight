import React, { useContext, useState } from "react";
import Button from "components/Button";
import PlayoffHelperTeamCellSet from "components/game_specific/PlayoffHelperTeamCell/GAME_YEAR";
import PlayoffHelperContext from "context/PlayoffHelperContext";
import getTeamName from "data/getTeamName";
import { Weights } from "data/game_specific/weighTeam/GAME_YEAR";
import { getOrdinalSuffix } from "util/getOrdinalSuffix";
import "./style.scss";

/**
 * Creates a team card to be used on the playoff helper screen.
 * @param {PlayoffTeam} team The `PlayoffTeam` object to display
 * @param {boolean} isOnTheClock Optional. Whether or not the team is a captain who is currently picking. Defaults to false
 * @param {boolean} captain Optional. Whether or not the team is the captain of their alliance. Defaults to false 
 * @param {boolean} consolidated Optional. Whether to show the full description of a team in a large card or to only show their RPI in a smaller card. Defaults to true
 * @param {Array} partners Optional. Any `PlayoffTeam` instances in this array will render in a single card along with the captain. `isOnTheClock` must be true for this value to have any affect. Defaults to an empty array 
 * @param {boolean} showPickButtons Optional. When true, shows buttons to pick or decline selection for the card. Defaults to false 
 * @param {boolean} visible Optional. Defaults to true
 */
export default function PlayoffHelperTeam({ team, isOnTheClock = false, captain = false, consolidated = true, partners = [], showPickButtons = false, visible = true }) {

    const playoffHelper = useContext(PlayoffHelperContext);
    const [activeTeam, setActiveTeam] = useState(team);
    const [infoBox, setInfoBox] = useState(false);

    // Tells playoff helper to pick this team after confirmation dialog
    const pickTeam = () => {
        playoffHelper.pickTeam(team.teamNumber);
    };

    // Tells playoff helper that this team declined after a confirmation dialog
    const declineTeam = () => {
        playoffHelper.declineTeam(team.teamNumber);
    };

    // Gets the text content to write in the info box
    const InfoBoxInnerContent = () => {
        // TODO ADD FLAGS HERE TOO (number of breakdowns, number of high penalty games)

        let bestAttribute = { rank: 1000, weight: "---" };
        let estimatedWinRate = Math.round((team.simulatedWinRate - playoffHelper.data.config.weightOfSimulations) * 1000) / 10;
        if (estimatedWinRate < 1) estimatedWinRate = ">1";

        Object.keys(Weights).forEach(weight => {
            if (team.powerScoreRankings[weight] < bestAttribute.rank) bestAttribute = { rank: team.powerScoreRankings[weight], weight };
        });
        
        return <>
            <div className="row">Base score used to rank team: <span className="strong">{Math.round(team.bestCompositeScore * 10) / 10}</span></div>
            <div className="row">Best strength: <span className="strong">{bestAttribute.weight}</span> ({getOrdinalSuffix(bestAttribute.rank)} at event)</div>
            { team.uniqueStrengthAdded != -1 &&
                <div className="row">Ranks <span className="strong">{getOrdinalSuffix(team.uniqueStrengthAddedRank)}</span> against remaining teams in improving the alliance&apos;s weaknesses ({Math.round(team.uniqueStrengthAdded * playoffHelper.data.config.weightOfUniqueStrengths * 10) / 10} points added to base score above)</div>
            }
            { team.simulatedWinRate != -1 &&
                <div className="row">Simulator estimates a <span className="strong">{estimatedWinRate}%</span> win rate against alliance&apos;s first round opponent ({getOrdinalSuffix(team.simulatedWinRateRank)} among remaining teams)</div>
            }
        </>
    };

    const teamNumber = team.teamNumber;
    const place = getOrdinalSuffix(team.qualRanking);
    const record = `(${team.getRecord()})`;
    const letterGrade = "A-";
    const partnerTeamNumbers = partners.map(p => p.teamNumber);

    return (
        <div className={`_PlayoffHelperTeam${ !visible ? " hidden" : "" }`}>
            <div className={`team-card${ isOnTheClock ? " on-the-clock" : "" }${ consolidated ? " consolidated" : "" }${ consolidated && captain ? " captain" : "" }`}>
                <div className="headline-row">
                    <div className="number-record">
                        <div className={`inline-entry team-number${partners.length > 0 && isOnTheClock ? " small" : ""}`}>{(partners.length == 0 || !isOnTheClock) ? teamNumber : `${teamNumber}, ${partnerTeamNumbers.join(", ")}`}</div>
                        { partners.length == 0 && <div className="inline-entry record">{place} {record}</div> }
                    </div>
                    { (!isOnTheClock && !consolidated) && <div className="inline-entry grade-info">
                        <div className="letter-grade">{letterGrade}</div>
                        <div className="info-button" onClick={() => setInfoBox(!infoBox)}>{infoBox ? "X" : "i"}</div>
                        <div className={`info-box${infoBox ? " visible" : ""}`}>
                            <InfoBoxInnerContent />
                        </div>
                    </div> }
                </div>
                <div className="label-row">
                    <div className="team-name">{ isOnTheClock ? ( partners.length > 0 ? "are on the clock..." : "is on the clock..." ) : getTeamName(teamNumber) }</div>
                    { (team.bestCompositeType !== null && !consolidated && !captain ) && <div className="best-available">Best {team.bestCompositeType} robot</div> }
                </div>
                { (isOnTheClock && partners.length > 0) && 
                    <div className="number-buttons">
                        { [team, ...partners].map(t => 
                            <div 
                                key={t.teamNumber}
                                className={`number${ t.teamNumber == activeTeam.teamNumber ? " active" : ""}`}
                                onClick={() => setActiveTeam(t)}
                            >
                                {t.teamNumber}
                            </div>
                        ) }
                    </div>
                }
                { consolidated ? <div className="rpi-row">{team.rpi.RPI} RPI ({getOrdinalSuffix(team.rpi.ranking)})</div>
                : 
                    <div className="cell-row">
                        <PlayoffHelperTeamCellSet team={activeTeam} />
                    </div>
                }
            </div>
            { showPickButtons && <div className="pick-buttons">
                <Button 
                    text="Select"
                    action={pickTeam}
                    className="pick-button"
                    marginTop={8}
                />
                <Button 
                    text="Decline"
                    action={declineTeam}
                    useBorder
                    className="pick-button"
                    marginTop={8}
                />
            </div>}
        </div>
    )
}