import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SingleMatchDisplay } from "screens/ViewTeam";
import PageHeader from "components/PageHeader";
import Button from "components/Button";
import FeedbackModalContext from "context/FeedbackModalContext";
import { findMatchDataByID, getTeamIndex } from "data/SearchData";
import TeamData from "data/TeamData";
import './style.scss';

/**
 * Screen that shows an interface used to resolve conflicts between match forms with same team + match + event
 */
export default function ImportConflicts() {

    const location = useLocation();
    const modalFunctions = useContext(FeedbackModalContext);
    if (location.state == null) return (
        <div className="SCREEN _ImportConflicts">
            <PageHeader text="Resolve Duplicates" />
            <p>There is no conflict data in memory to fix.</p>
        </div>
    )
    let pairSource = location.state.softDuplicates;
    const [pairingData, setPairingData] = useState([]);

    useEffect(() => {
        // Sort through the matches, ensuring that they all still exist and are paired together properly
        // Flatten the array and remove duplicate matches
        let allMatches = [], deletions = [], pairings = [];
        pairSource.forEach(pair => {
            allMatches.push(pair.incoming, pair.existing);
        });
        allMatches.forEach((match, ind) => {
            for (let i = ind + 1; i < allMatches.length; i ++) {
                if (match.id == allMatches[i].id) {
                    deletions.unshift(ind);
                }
            }
        });
        deletions.forEach(ind => allMatches.splice(ind, 1));

        // Create pairings
        // The pairings array contains objects with attributes `eventCode`, `matchNumber`, `teamNumber`, and an array of `matches`
        allMatches.forEach(match => {
            let pair = pairings.find(m => m.eventCode == match.eventCode && m.matchNumber == match.matchNumber && m.teamNumber == match.teamNumber);
            if (pair == undefined) pairings.push({ 
                matches: [match], 
                eventCode: match.eventCode, 
                matchNumber: match.matchNumber, 
                teamNumber: match.teamNumber 
            }); else pair.matches.push(match);
        });

        setPairingData(pairings);
    }, []);

    const deleteMatch = (matchId, matchTeamNumber) => {
        // Delete from pairing array
        let pairings = pairingData.map(o => o);
        let pair = null, pairMatchIndex = -1, pairIndex = -1;
        pairings.every((p, i) => {
            let ind = p.matches.findIndex(m => m.id == matchId);
            if (ind != -1) {
                pair = p;
                pairMatchIndex = ind;
                pairIndex = i;
                return false;
            }
            return true;
        });
        if (pair != null) {
            pair.matches.splice(pairMatchIndex, 1);
            if (pair.matches.length <= 1) pairings.splice(pairIndex, 1);
        } else {
            modalFunctions.setModal("That match couldn't be found in the conflict data. Was it already deleted?", true);
            return;
        }
        setPairingData(pairings);

        // Delete from memory
        let matchFindObj = findMatchDataByID(matchId);
        if (!matchFindObj) {
            modalFunctions.setModal("That match couldn't be found. Was it already deleted?", true);
            return;
        } else {
            // Check if this is the last match in team's memory or not
            if (matchFindObj.dataset.length == 1) {
                TeamData.splice(getTeamIndex(matchTeamNumber), 1);
            } else {
                matchFindObj.dataset.splice(matchFindObj.index, 1);
            }
        }
    }

    return (
        <div className="SCREEN _ImportConflicts">
            <PageHeader text="Resolve Duplicates" />
            <div className="content-area">
                {
                    pairingData.length > 0 ? pairingData.map((pair, ind) => {
                        return <div className="conflict" key={ind}>
                            <h2>Conflict {ind + 1}: Team {pair.matches[0].teamNumber}</h2>
                            { pair.matches.map((p, i) =>
                                <div 
                                    className="single-match-container" 
                                    key={i}
                                >
                                    <SingleMatchDisplay
                                        match={p}
                                        showActions={false}
                                    />
                                    <Button
                                        text="Delete"
                                        style={{ maxHeight: 22, margin: "24px 0 0 8px" }}
                                        action={() => deleteMatch(p.id, p.teamNumber)}
                                    />
                                </div>
                            )}
                        </div>
                    }) : <p>You have no conflicts left to resolve!</p>
                }
            </div>
        </div>
    )
}