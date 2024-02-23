import React, { useContext, useEffect, useState } from "react";
import Input from "components/Input";
import Button from "components/Button";
import PageHeader from "components/PageHeader";
import PlayoffHelperContext from "context/PlayoffHelperContext";
import { PlayoffHelperState } from "data/PlayoffHelperData";
import FeedbackModalContext from "context/FeedbackModalContext";
import DialogBoxContext from "context/DialogBoxContext";
import PlayoffHelperTeam from "components/PlayoffHelperTeam";
import "./style.scss";
import sleep from "util/sleep";

/**
 * A series of screens related to setting up the playoff helper and using it.
 */
export default function PlayoffHelper() {
    
    const playoffHelper = useContext(PlayoffHelperContext);
    const state = playoffHelper.data.state;

    return (
        <div className="SCREEN _PlayoffHelper">
            <PageHeader text="Playoff Helper" />
            <div className="content-area">
                { ( state == PlayoffHelperState.INACTIVE || state == PlayoffHelperState.READY ) && <RankingInput /> }
                { ( state == PlayoffHelperState.LIVE_DRAFT ) && <LiveDraft /> }
            </div>
        </div>
    )
}

// Screen that shows initial configuration inputs
function RankingInput() {

    const feedbackModal = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const playoffHelper = useContext(PlayoffHelperContext);

    const [useTBA, setUseTBA] = useState(true);
    const [eventKey, setEventKey] = useState("");
    const [backupSelections, setBackupSelections] = useState(false);

    const preparePlayoffHelper = () => {
        if (useTBA) {
            // Get rankings from TBA
            playoffHelper.getTBARankings(eventKey, () => {
                // Error with API
                feedbackModal.setModal("Something went wrong while polling The Blue Alliance API.", true);
            });
        } else {
            // Log rankings from user input
        }
    };

    const startSimulatedDraft = () => {
        playoffHelper.setup(PlayoffHelperState.SIMULATED_DRAFT, backupSelections);
    };

    const startLiveDraft = () => {
        playoffHelper.setup(PlayoffHelperState.LIVE_DRAFT, backupSelections);
    };

    const deleteData = () => {
        dialogFunctions.setDialog({
            body: "Team ranking data will be deleted from the system. This will not affect any of your scouting data. Would you like to proceed?",
            useConfirmation: true,
            confirmFunction: () => { playoffHelper.reset(true); feedbackModal.setModal("Successfully reset the playoff helper.", false) },
            confirmLabel: "Yes",
            cancelLabel: "No"
        });
    };


    return (
        <div className="_RankingInput">
            <h2>Ranking Data</h2>
            <p>
                This tool can help you select teams during alliance selections, or it can simulate the result of an event using scouting data.
                First, specify the final rankings of the qualification rounds.
            </p>
            <div className="horizontal-line"></div>
            <div className={`input-area${ playoffHelper.data.state == PlayoffHelperState.READY ? " inactive" : "" }`}>
                <Input
                    id="select-backups"
                    isCheckbox
                    label="Select back-ups (4-robot alliances)"
                    onInput={ e => setBackupSelections(e.target.checked) }
                />
                <Input
                    id="use-tba"
                    isCheckbox
                    label="Get ranking data from The Blue Alliance"
                    onInput={ e => setUseTBA(e.target.checked) }
                    prefill={useTBA}
                />
                { useTBA ? <div>
                    <Input
                        id="event-key"
                        label="TBA event key"
                        onInput={ e => setEventKey(e.target.value) }
                    />
                </div> : <div>
                    <h3>Manual Rankings</h3>
                </div> }
            </div>

            { playoffHelper.data.state == PlayoffHelperState.READY && <p>
                Ranking data is prepared and ready to use!
            </p> }
            <div className="submission-buttons">
                { playoffHelper.data.state == PlayoffHelperState.INACTIVE && <>
                    <Button
                        text="Submit data"
                        action={ preparePlayoffHelper }
                    />
                </> }
                { playoffHelper.data.state == PlayoffHelperState.READY && <>
                    <Button
                        text="Begin live playoff draft"
                        action={ startLiveDraft }
                    />
                    <Button
                        text="Simulate playoff draft"
                    />
                    <Button
                        text="Reset data"
                        action={ deleteData }
                        useBorder
                    />
                </> }
            </div>
        </div>
    )
}

// A component of screens showing an alliance as a row
function AllianceRow({ teams, isOnTheClock = false, seed = 0, rpi = 0, rpiLabel = "???" }) {

    const playoffHelper = useContext(PlayoffHelperContext);
    const [picklist, setPicklist] = useState([]);

    useEffect(() => {
        getNewPicklist();
    }, [playoffHelper]);

    const getNewPicklist = async () => {
        setPicklist([]);
        if (!isOnTheClock) return;

        let pl = await playoffHelper.generatePicklist();
        setPicklist(pl);
    };

    return (
        <div className="_AllianceRow">
            <div className="alliance-labels">
                <div className="ranking">#{seed}</div>
                <div className="rpi">{rpi}</div>
                <div className="rpi-label">RPI ({rpiLabel})</div>
            </div>
            { !isOnTheClock ? <div className="alliance-teams">
                { teams.map((team, index) => <PlayoffHelperTeam 
                    key={index}
                    team={team}
                    isOnTheClock={isOnTheClock && index == 0}
                    captain={index == 0}
                    partners={teams.slice(1)}
                    consolidated={!isOnTheClock}
                    visible={!isOnTheClock || index == 0}
                /> )}
            </div> 
            : <div className="alliance-container">
                <PlayoffHelperTeam
                    team={teams[0]}
                    isOnTheClock
                    captain
                    partners={teams.slice(1)}
                    consolidated={false}
                />
                <div className="alliance-teams on-clock">
                    { isOnTheClock && picklist.map((team, index) => <PlayoffHelperTeam 
                        key={index}
                        team={team}
                        consolidated={false}
                        showPickButtons
                    /> )}
                </div>
            </div>}
        </div>
    )
}

// Screen that shows while alliance selection is taking place
function LiveDraft() {

    const playoffHelper = useContext(PlayoffHelperContext);

    return (
        <div className="_LiveDraft">
            <div className="alliance-list">
                { playoffHelper.data.alliances.map(((alliance, seed) => {
                    return <AllianceRow 
                        key={seed}
                        seed={seed + 1}
                        teams={ alliance.map(team => playoffHelper.getTeam(team)) }
                        isOnTheClock={playoffHelper.data.draftState.alliance == seed}
                    />
                })) }
            </div>
        </div>
    )
}