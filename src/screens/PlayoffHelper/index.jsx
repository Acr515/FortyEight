import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PlayoffHelperTeam from "components/PlayoffHelperTeam";
import { DEVELOP_MODE } from "/src/config";
import Input from "components/Input";
import Button from "components/Button";
import PageHeader from "components/PageHeader";
import LoadingSpinner from "components/LoadingSpinner";
import Spinner from "components/Spinner";
import { TeamNumberInput } from "screens/SimulatorConfig";
import PlayoffHelperContext from "context/PlayoffHelperContext";
import FeedbackModalContext from "context/FeedbackModalContext";
import DialogBoxContext from "context/DialogBoxContext";
import Simulator from "data/game_specific/Simulator/_Universal";
import TeamData from "data/TeamData";
import PlayoffHelperFunctions, { PlayoffHelperState } from "data/PlayoffHelperData";
import { getTeamData, getTeamNumberArray } from "data/SearchData";
import sleep from "util/sleep";
import { getOrdinalSuffix } from "util/getOrdinalSuffix";
import { Method, sortTeams } from "util/sortData";
import CheckImage from "assets/images/check.png";
import XImage from 'assets/images/x.png';
import DotsImage from 'assets/images/three-dots.png';
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
    
    const location = useLocation();
    const playoffHelper = useContext(PlayoffHelperContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const feedbackModal = useContext(FeedbackModalContext);
    const [subpageState, setSubpageState] = useState(SUBPAGE.LiveSelection);
    const [cachedBracket, setCachedBracket] = useState(null);
    const [headerTabsOpen, setHeaderTabsOpen] = useState(false);

    const state = playoffHelper.data.state;

    // Resets all playoff helper data
    const resetData = () => {
        dialogFunctions.setDialog({
            body: "All playoff-related data will be deleted from the system. This will not affect any of your scouting data. Would you like to proceed?",
            useConfirmation: true,
            confirmFunction: () => { 
                playoffHelper.reset(true);
                feedbackModal.setModal("Successfully reset the playoff helper.", false);
                setHeaderTabsOpen(false);
                setCachedBracket(null);
            },
            confirmLabel: "Yes",
            cancelLabel: "No"
        });
    };

    // Check to see if there was any state in the location object
    useEffect(() => {
        if (location.state !== null) {
            // Check for a cached playoff bracket
            if (typeof location.state.cachedBracket !== 'undefined') {
                setCachedBracket(location.state.cachedBracket);
                setSubpageState(SUBPAGE.SimulatedBracket);
            }
        }
    }, []);

    return (
        <div className="SCREEN _PlayoffHelper">
            <PageHeader text="Playoff Helper">
                <div className={`header-tab-container ${headerTabsOpen ? "open" : ""}`}>
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
                </div>
                <div 
                    className={`header-tab-expander ${headerTabsOpen ? "open" : ""}`} 
                    onClick={() => setHeaderTabsOpen(!headerTabsOpen)}
                    style={{ display: state == PlayoffHelperState.LIVE_PLAYOFFS || state == PlayoffHelperState.SIMULATED_PLAYOFFS || state == PlayoffHelperState.LIVE_DRAFT ? "block" : "none" }}
                >
                    <div className={`icon small ${ headerTabsOpen ? "visible" : "" }`} style={{ backgroundImage: `url(${ XImage })` }}></div>
                    <div className={`icon ${ !headerTabsOpen ? "visible" : "" }`} style={{ backgroundImage: `url(${ DotsImage })` }}></div>
                </div>
            </PageHeader>
            <div className="content-area">
                { ( state == PlayoffHelperState.INACTIVE || state == PlayoffHelperState.READY ) && <RankingInput setSubpageState={setSubpageState} /> }
                { ( state == PlayoffHelperState.LIVE_DRAFT ) && <LiveDraft subpageState={subpageState} setSubpageState={setSubpageState} /> }
                { ( state == PlayoffHelperState.SIMULATED_DRAFT ) && <SimulatingDraft subpageState={subpageState} setSubpageState={setSubpageState} /> }
                { ( state == PlayoffHelperState.LIVE_PLAYOFFS || state == PlayoffHelperState.SIMULATED_PLAYOFFS ) && <FinishedDraft subpageState={subpageState} setSubpageState={setSubpageState} cachedBracket={cachedBracket} setCachedBracket={setCachedBracket}/> }
            </div>
        </div>
    )
}

// Screen that shows initial configuration inputs
function RankingInput({ setSubpageState }) {

    const feedbackModal = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const playoffHelper = useContext(PlayoffHelperContext);

    const [useTBA, setUseTBA] = useState(true);
    const [eventKey, setEventKey] = useState("");
    const [backupSelections, setBackupSelections] = useState(false);
    const [manualRankings, setManualRankings] = useState([{ number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }]);

    const teamNumbers = getTeamNumberArray(TeamData);
    const phRef = useRef();
    phRef.current = playoffHelper;

    const preparePlayoffHelper = () => {
        if (useTBA) {
            // Get rankings from TBA
            if (eventKey == "") {
                feedbackModal.setModal("Please supply an event key to continue.", true);
                return;
            }

            playoffHelper.getTBARankings(eventKey, () => {
                // Error with API
                feedbackModal.setModal("Something went wrong while polling The Blue Alliance API. Please make sure you have a stable internet connection and that the event key is valid and try again.", true);
            });
        } else {
            // Feed rankings in manually
            if (manualRankings.length < 24 && !backupSelections) {
                feedbackModal.setModal("You must supply at least 24 teams to proceed.", true);
                return;
            }
            if (manualRankings.length < 32 && backupSelections) {
                feedbackModal.setModal("You must supply at least 32 teams to create a 4-team alliance draft.", true);
                return;
            }

            // Make sure teams all have existing data
            let teamsValid = true;
            manualRankings.forEach(team => {
                if (getTeamData(Number(team.number)) == null) teamsValid = false;
            });
            if (!teamsValid) {
                feedbackModal.setModal("A field was left blank or a team couldn't be found in your dataset. Please review your selections and try again.", true);
                return;
            }

            // Make sure there are no duplicate teams
            let duplicates = manualRankings
                .map(e => e.number)
                .map((e, i, final) => final.indexOf(e) !== i && i)
                .filter(obj=> manualRankings[obj])
                .map(e => manualRankings[e].number)
            if (duplicates.length > 0) {
                feedbackModal.setModal(`Team${ duplicates.length > 1 ? "s" : "" } ${ duplicates.join(", ") } exist${ duplicates.length > 1 ? "" : "s" } multiple times in the ranking list. Please remove any repeated team entries and try again.`, true);
                return;
            }

            // Parse out the data and start prepping the playoff helper for use
            playoffHelper.setManualRankings(manualRankings.map(t => t.number));
        }
    };

    const setupSimulatedDraft = () => {
        if (!playoffHelper.setup(PlayoffHelperState.SIMULATED_DRAFT, backupSelections)) {
            feedbackModal.setModal("Your dataset does not include all of the teams at the event you requested. Please check the console for more details and try again.", true);
        }
    };

    const startLiveDraft = () => {
        if (!playoffHelper.setup(PlayoffHelperState.LIVE_DRAFT, backupSelections)) {
            feedbackModal.setModal("Your dataset does not include all of the teams at the event you requested. Please check the console for more details and try again.", true);
        } else {
            setSubpageState(SUBPAGE.LiveSelection);
            if (!DEVELOP_MODE) dialogFunctions.setDialog({
                body: "Disclaimer: This tool is imperfect and should NOT be a substitution for human judgement. It is intended to only supplement the decision-making of your team and your alliance."
            });
        }
    };

    const deleteData = () => {
        dialogFunctions.setDialog({
            body: "Team ranking data will be deleted from the system. This will not affect any of your scouting data. Would you like to proceed?",
            useConfirmation: true,
            confirmFunction: () => {
                setManualRankings([ { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" }, { number: "" } ]);
                playoffHelper.reset(true); 
                feedbackModal.setModal("Successfully reset the playoff helper.", false) 
            },
            confirmLabel: "Yes",
            cancelLabel: "No"
        });
    };

    const autoPopulateManualTeams = () => {
        let teams = sortTeams(TeamData, Method.StrengthDescending).map(team => ({ number: team.number }));
        setManualRankings(teams);
    }

    const updateManualTeamNumber = (number, index) => {
        let rankingsCopy = manualRankings.map(t => ({ number: t.number }));
        rankingsCopy[index].number = number;
        setManualRankings(rankingsCopy);
    };

    const deleteManualTeamNumber = (index) => {
        let rankingsCopy = manualRankings.map(t => ({ number: t.number }));
        rankingsCopy.splice(index, 1);
        setManualRankings(rankingsCopy);
    };

    const addManualTeamNumber = () => {
        let rankingsCopy = manualRankings.map(t => ({ number: t.number }));
        rankingsCopy.push({ number: "" });
        setManualRankings(rankingsCopy);
    };

    const shiftTeam = (ind, dir) => {
        let rankingsCopy = manualRankings.map(t => ({ number: t.number }));
        if (ind == 0 && dir == -1) return;
        if (ind == rankingsCopy.length - 1 && dir == 1) return;
        
        let team = rankingsCopy.splice(ind, 1)[0];
        rankingsCopy.splice(ind + dir, 0, team);
        setManualRankings(rankingsCopy);
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
                    <div className="rankings-header">
                        <h3>Manual Rankings</h3>
                        <button className="populate-button" onClick={autoPopulateManualTeams}>Auto-populate teams from my dataset</button>
                    </div>
                    <div className="ranking-list">
                        {
                            manualRankings.map((team, ind) => 
                                <div className="manual-team-input" key={ind}>
                                    <div 
                                        className={`x-icon`} 
                                        style={{ backgroundImage: `url(${ XImage })` }}
                                        onClick={() => deleteManualTeamNumber(ind)}
                                    ></div>
                                    <Spinner
                                        increment={() => shiftTeam(ind, -1)}
                                        decrement={() => shiftTeam(ind, 1)}
                                    />
                                    <div className="ranking">{getOrdinalSuffix(ind + 1)}</div>
                                    <TeamNumberInput
                                        useAllianceBasedState={false}
                                        teamNumbers={teamNumbers}
                                        stateVar={team.number}
                                        stateFunc={(num) => updateManualTeamNumber(num, Number(ind))}
                                    />
                                </div>
                            )
                        }
                        <div 
                            className="add-team-button"
                            onClick={addManualTeamNumber}
                        >
                            Add new team...
                        </div>
                    </div>
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

// A component for screens that show an alliance as a row
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
            { subpageState == SUBPAGE.DraftBoard && <DraftBoard /> }
        </div>
    )
}

// Shows the draft board
function DraftBoard() {
    const playoffHelper = useContext(PlayoffHelperContext);
    const [sortMethod, setSortMethod] = useState(0);

    const updateSort = method => {

    };

    return (
        <div className="_DraftBoard">
            <div className="under-construction">This feature is under construction.</div>
        </div>
    )
}

// Screen that shows after alliance selection is done
function FinishedDraft({ subpageState, setSubpageState, cachedBracket, setCachedBracket }) {

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
            { subpageState == SUBPAGE.SimulatedBracket && <SimulatedPlayoffs subpageState={subpageState} cachedBracket={cachedBracket} setCachedBracket={setCachedBracket} /> }
        </div>
    )
}

// Screen that shows for the playoff bracket simulator
function SimulatedPlayoffs({ subpageState, cachedBracket, setCachedBracket }) {

    const [playoffResults, setPlayoffResults] = useState(cachedBracket);
    const [simulationInProgress, setSimulationInProgress] = useState(false);
    const playoffHelper = useContext(PlayoffHelperContext);

    const navigate = useNavigate();

    // Sent to every playoff match to give each the ability to view the breakdown for each match
    const viewMatch = async (match) => {
        var simulator = new Simulator(
            match.redTeams.slice(0, 3),
            match.blueTeams.slice(0, 3), 
            {
                simulations: 1000, 
                applyDefense: true,
            }
        );
        await simulator.run(results => {
            // Simulator is done- go to viewer but cache the bracket results so that they reappear when we return
            navigate("/analysis/viewer", { state: { 
                results, 
                overrideLocation: "/analysis/playoffs", 
                returnState: { subpage: subpageState, cachedBracket: playoffResults } 
            } });
        });
    }

    // Sets the state variable indicating that simulation should start
    const initiateSimulation = () => {
        setSimulationInProgress(true);
    };

    // Runs the simulateBracket function, triggered by useEffect
    const runSimulation = async () => {
        let results = await PlayoffHelperFunctions.simulateBracket(playoffHelper.data);
        setPlayoffResults(results);
        setCachedBracket(results);
        setSimulationInProgress(false);
    };

    // Waits for simulationInProgress to change before beginning the simulation
    useEffect(() => {
        if (simulationInProgress) runSimulation();
    }, [simulationInProgress]);

    return (
        <div className="_SimulatedPlayoffs">
            { (playoffResults == null && !simulationInProgress) && 
                <div className="button-screen">
                    <p>Click the button below to generate an estimated playoff bracket and projected tournament winner.</p>
                    <Button
                        text="Simulate playoffs"
                        action={initiateSimulation}
                    />
                </div>
            }
            { simulationInProgress &&
                <div className="loading-screen">
                    <LoadingSpinner className="spinner" />
                    <p className="caption">Simulating playoff bracket...</p>
                </div>
            }
            { (playoffResults != null && !simulationInProgress) &&
                <div className="match-container">
                    <div className="round-column" style={{ paddingLeft: 0 }}>
                        <h2>Round 1</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[0][0]} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[0][1]} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[0][2]} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[0][3]} />
                    </div>
                    <div className="round-column">
                        <h2>Round 2</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[1][2]} marginTop={100} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[1][3]} marginTop={180} marginBottom={200} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[1][0]} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[1][1]} />
                    </div>
                    <div className="round-column">
                        <h2>Round 3</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[2][1]} marginTop={700} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[2][0]} marginTop={50}/>
                    </div>
                    <div className="round-column">
                        <h2>Round 4</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[3][0]} marginTop={300} />
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[3][1]} marginTop={300}/>
                    </div>
                    <div className="round-column">
                        <h2>Round 5</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[4][0]} marginTop={540} />
                    </div>
                    <div className="round-column">
                        <h2>Championship</h2>
                        <SimulatedMatch viewMatch={viewMatch} match={playoffResults[5][0]} marginTop={300} />
                    </div>
                </div>
            }
        </div>
    )
}

// Component that shows the result of a specific match
function SimulatedMatch({ match, marginTop, marginBottom, viewMatch }) {

    return (
        <div className="_SimulatedMatch" style={{ marginTop, marginBottom }}>
            <div className="match-info">
                <div className="match-number">{match.matchNumber == 14 ? "Championship" : `Match ${match.matchNumber}`}</div>
                <div className="breakdown" onClick={() => viewMatch(match)}>View breakdown</div>
            </div>
            <div className="alliance-row">
                <div className="seed-region red">
                    <div className="seed">{ match.redSeed + 1 }</div>
                    { match.winningSeed == match.redSeed && <div className="win-indicator" style={{ backgroundImage: 'url(' + CheckImage + ')' }}></div> }
                </div>
                <div className="alliance-details red">
                    <div className="alliance-numbers">
                        { match.redTeams.map(n => (<div key={n}>{n}</div>)) }
                    </div>
                    <div className="win-rate">
                        { match.redWinRate }% win probability
                    </div>
                </div>
            </div>
            <div className="alliance-row">
                <div className="seed-region blue">
                    <div className="seed">{ match.blueSeed + 1 }</div>
                    { match.winningSeed == match.blueSeed && <div className="win-indicator" style={{ backgroundImage: 'url(' + CheckImage + ')' }}></div> }
                </div>
                <div className="alliance-details blue">
                    <div className="alliance-numbers">
                        { match.blueTeams.map(n => (<div key={n}>{n}</div>)) }
                    </div>
                    <div className="win-rate">
                        { match.blueWinRate }% win probability
                    </div>
                </div>
            </div>
        </div>
    )
}