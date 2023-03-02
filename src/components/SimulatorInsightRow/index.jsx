import TeamLink from "components/TeamLink";
import React from "react";
import './style.scss';

/**
 * The individual row component of data on the left-column of the Insights area of the simulator.
 * @param {string} label The label to write in the middle of the stat
 * @param {string} winnerValue The value of the winner's attribute. Usually a number but can be a string
 * @param {string} winnerColor The color of the winner
 * @param {string} winnerValue The value of the loser's attribute. Usually a number but can be a string
 * @param {string} winnerColor The color of the loser
 * @param {boolean} hyperlinkTeams Use this when the statistic being shown is a team number. This will allow users to click on the team # to pull up its details page
 */
export default function SimulatorInsightRow({ label, winnerValue, winnerColor, loserValue, loserColor, hyperlinkTeams = false }) {
    return <div className="_SimulatorInsightRow">
        { hyperlinkTeams ? 
            <TeamLink 
                className="number" 
                style={{color: winnerColor}}
                number={winnerValue}
            >
                {winnerValue}    
            </TeamLink> 
        : 
            <div className="number" style={{color: winnerColor}}>
                {winnerValue}
            </div>
        }
        <div className="label">{label}</div>
        { hyperlinkTeams ? 
            <TeamLink 
                className="number" 
                style={{color: loserColor}}
                number={loserValue}
            >
                {loserValue}    
            </TeamLink> 
        : 
            <div className="number" style={{color: loserColor}}>
                {loserValue}
            </div>
        }
    </div>
}