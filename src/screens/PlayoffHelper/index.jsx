import React, { useContext, useEffect, useRef, useState } from "react";
import Input from "components/Input";
import Button from "components/Button";
import PageHeader from "components/PageHeader";
import LoadingSpinner from "components/LoadingSpinner";
import PlayoffHelperContext from "context/PlayoffHelperContext";
import { PlayoffHelperState } from "data/PlayoffHelperData";
import FeedbackModalContext from "context/FeedbackModalContext";
import DialogBoxContext from "context/DialogBoxContext";
import PlayoffHelperTeam from "components/PlayoffHelperTeam";
import sleep from "util/sleep";
import "./style.scss";

const SUBPAGE = {
    LiveSelection: "Live Selection",
    DraftBoard: "Draft Board",
    Alliances: "Alliances",
    SimulatedBracket: "Simulated Bracket",
};

/**
 * A series of screens related to setting up the playoff helper and using it.
 */
export default function PlayoffHelper() {
    
    const playoffHelper = useContext(PlayoffHelperContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const feedbackModal = useContext(FeedbackModalContext);
    const [subpageState, setSubpageState] = useState(SUBPAGE.LiveSelection);

    const state = playoffHelper.data.state;

    const resetData = () => {
        dialogFunctions.setDialog({
            body: "All playoff-related data will be deleted from the system. This will not affect any of your scouting data. Would you like to proceed?",
            useConfirmation: true,
            confirmFunction: () => { playoffHelper.reset(true); feedbackModal.setModal("Successfully reset the playoff helper.", false) },
            confirmLabel: "Yes",
            cancelLabel: "No"
        });
    }

    return (
        <div className="SCREEN _PlayoffHelper">
            <PageHeader text="Playoff Helper">
                { (state == PlayoffHelperState.LIVE_DRAFT && subpageState == SUBPAGE.DraftBoard) && 
                    <div className="pick-status">
                        <div className="alliance-seed">#{playoffHelper.data.draftState.alliance + 1}</div>
                        <div className="on-the-clock">is on the clock...</div>
                    </div>
                }
                { (state == PlayoffHelperState.LIVE_PLAYOFFS || state == PlayoffHelperState.SIMULATED_PLAYOFFS) && <div className="header-buttons"> 
                    <div className={`button ${ subpageState == SUBPAGE.Alliances ? "active" : "" }`} onClick={ () => setSubpageState(SUBPAGE.Alliances) }>Alliances</div>
                    <div className={`button ${ subpageState == SUBPAGE.SimulatedBracket ? "active" : "" }`} onClick={ () => setSubpageState(SUBPAGE.SimulatedBracket) }>Simulated Bracket</div>
                    <div className="button" onClick={resetData}>Reset</div>
                </div> }
                { (state == PlayoffHelperState.LIVE_DRAFT) && <div className="header-buttons"> 
                    <div className={`button ${ subpageState == SUBPAGE.LiveSelection ? "active" : "" }`} onClick={ () => setSubpageState(SUBPAGE.LiveSelection) }>Live Selection</div>
                    <div className={`button ${ subpageState == SUBPAGE.DraftBoard ? "active" : "" }`} onClick={ () => setSubpageState(SUBPAGE.DraftBoard) }>Draft Board</div>
                    <div className="button" onClick={resetData}>Reset</div>
                </div> }
            </PageHeader>
            <div className="content-area">
                { ( state == PlayoffHelperState.INACTIVE || state == PlayoffHelperState.READY ) && <RankingInput /> }
                { ( state == PlayoffHelperState.LIVE_DRAFT ) && <LiveDraft subpageState={subpageState} setSubpageState={setSubpageState} /> }
                { ( state == PlayoffHelperState.SIMULATED_DRAFT ) && <SimulatingDraft subpageState={subpageState} setSubpageState={setSubpageState} /> }
                { ( state == PlayoffHelperState.LIVE_PLAYOFFS || state == PlayoffHelperState.SIMULATED_PLAYOFFS ) && <FinishedDraft subpageState={subpageState} setSubpageState={setSubpageState} /> }
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

    const phRef = useRef();
    phRef.current = playoffHelper;

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

    const setupSimulatedDraft = () => {
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
                    disabled={ playoffHelper.data.state == PlayoffHelperState.READY }
                />
                <Input
                    id="use-tba"
                    isCheckbox
                    label="Get ranking data from The Blue Alliance"
                    onInput={ e => setUseTBA(e.target.checked) }
                    prefill={useTBA}
                    disabled={ playoffHelper.data.state == PlayoffHelperState.READY }
                />
                { useTBA ? <div>
                    <Input
                        id="event-key"
                        label="TBA event key"
                        onInput={ e => setEventKey(e.target.value) }
                        disabled={ playoffHelper.data.state == PlayoffHelperState.READY }
                    />
                </div> : <div>
                    <h3>Manual Rankings</h3>
                    <p>Manual input is not available at this time. Please use the TBA integration feature.</p>
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
                    { localStorage.getItem("playoffHelper") != null && <Button
                        text="Load draft"
                        action={ () => playoffHelper.loadDraftResults() }
                        useBorder
                    /> }
                </> }
                { playoffHelper.data.state == PlayoffHelperState.READY && <>
                    <Button
                        text="Begin live playoff draft"
                        action={ startLiveDraft }
                    />
                    <Button
                        text="Simulate playoff draft"
                        action={ setupSimulatedDraft }
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

// A component showing the progress of the draft
function SimulatingDraft({ setSubpageState }) {
    
    const playoffHelper = useContext(PlayoffHelperContext);
    const phRef = useRef()
    phRef.current = playoffHelper.data;
    
    const startSimulatedDraft = async () => { await sleep(500); await playoffHelper.simulateDraft(); }
    useEffect(() => { 
        if (playoffHelper.data.state == PlayoffHelperState.SIMULATED_DRAFT) {
            startSimulatedDraft();
            setSubpageState(SUBPAGE.Alliances);
        }
    }, []);

    return (
        <div className="_SimulatingDraft">
            <LoadingSpinner className="spinner" />
            <p className="caption">Simulating draft...</p>
        </div>
    )
}

// A component of screens showing an alliance as a row
function AllianceRow({ teams, isOnTheClock = false, seed = 0 }) {

    const playoffHelper = useContext(PlayoffHelperContext);
    const [picklist, setPicklist] = useState([]);
    const [rpi, setRpi] = useState(playoffHelper.getAllianceRPI(seed - 1));

    useEffect(() => {
        getNewPicklist();
        setRpi(playoffHelper.getAllianceRPI(seed - 1));
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
                <div className="rpi">{rpi.RPI}</div>
                <div className="rpi-label">RPI</div>
                <div className="rpi-rating">({rpi.rating})</div>
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
function LiveDraft({ subpageState }) {

    const playoffHelper = useContext(PlayoffHelperContext);

    return (
        <div className="_LiveDraft">
            { subpageState == SUBPAGE.LiveSelection && 
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
            }
            { subpageState == SUBPAGE.DraftBoard &&
                <div>

                </div>
            }
        </div>
    )
}

// Screen that shows after alliance selection is done
function FinishedDraft({ subpageState, setSubpageState }) {

    const playoffHelper = useContext(PlayoffHelperContext);
    useEffect(() => {
        setSubpageState(SUBPAGE.Alliances);
    }, []);

    return (
        <div className="_LiveDraft">
            { subpageState == SUBPAGE.Alliances && 
                <div className="alliance-list">
                    { playoffHelper.data.alliances.map(((alliance, seed) => {
                        return <AllianceRow 
                            key={seed}
                            seed={seed + 1}
                            teams={ alliance.map(team => playoffHelper.getTeam(team)) }
                        />
                    })) }
                </div>
            }
            { subpageState == SUBPAGE.SimulatedBracket && 
                <div>

                </div>
            }
        </div>
    )
}