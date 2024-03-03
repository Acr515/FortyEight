import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/Button";
import Input from "components/Input";
import PageHeader from "components/PageHeader";
import DialogBoxContext from "context/DialogBoxContext";
import FeedbackModalContext from "context/FeedbackModalContext";
import PlayoffHelperContext from "context/PlayoffHelperContext";
import Simulator from "data/game_specific/Simulator/_Universal";
import getTeamName from "data/getTeamName";
import { getTeamNumberArray } from "data/SearchData";
import TeamData from "data/TeamData";
import sleep from "util/sleep";
import { PlayoffHelperState } from "data/PlayoffHelperData";
import './style.scss';

export default function SimulatorConfig() {
    const modalFunctions = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const playoffHelper = useContext(PlayoffHelperContext);
    const navigate = useNavigate();


    // Figure out if we're returning from the simulation viewer so we can prefill the form from query params
    const urlSearchParams = new URLSearchParams(window.location.hash);
    var prefill = Object.fromEntries(urlSearchParams.entries());
    var configPrefill = false;
    if (typeof prefill.t !== 'undefined') {
        configPrefill = true;
        prefill.t = JSON.parse(prefill.t);
        prefill.sims = Number(prefill.sims);
        prefill.def = prefill.def == "true";
    }

    // Get playoff helper information if it exists


    const [useTextboxes, setUseTextboxes] = useState(false);
    const [useMatchImport, setUseMatchImport] = useState(false);
    const [usePlayoffTeams, setUsePlayoffTeams] = useState(false);
    const [useDefense, setUseDefense] = useState(prefill.def ?? false);
    const [simulations, setSimulations] = useState(configPrefill ? prefill.sims : 1000);
    const [importEventCode, setImportEventCode] = useState(localStorage.getItem("EventCodePrefill") || "");
    const [importMatch, setImportMatch] = useState("");

    const teamNumbers = getTeamNumberArray(TeamData);
    const [redTeams, setRedTeams] = useState(configPrefill ? [prefill.t[0], prefill.t[1], prefill.t[2]] : ["", "", ""]);
    const [blueTeams, setBlueTeams] = useState(configPrefill ? [prefill.t[3], prefill.t[4], prefill.t[5]] : ["", "", ""]);
    const [redAllianceSeed, setRedAllianceSeed] = useState(0);
    const [blueAllianceSeed, setBlueAllianceSeed] = useState(1);
    const [benchedRedTeam, setBenchedRedTeam] = useState(-1);
    const [benchedBlueTeam, setBenchedBlueTeam] = useState(-1);

    // Runs before the simulation starts
    const verifySettings = async () => {
        let incomplete = false, invalid = false;
        let inputRedTeams = [...redTeams], inputBlueTeams = [...blueTeams];

        if (usePlayoffTeams) {
            if (inputRedTeams.length > 3) inputRedTeams.splice(benchedRedTeam, 1);
            if (inputBlueTeams.length > 3) inputBlueTeams.splice(benchedBlueTeam, 1);
        }

        const validateNum = num => {
            if (teamNumbers.indexOf(num) == -1) invalid = true;
            if (num == "" || Number(num) == 0) incomplete = true;
        }
        inputRedTeams.forEach(num => validateNum(num));
        inputBlueTeams.forEach(num => validateNum(num));

        if (incomplete) {
            modalFunctions.setModal("You did not provide enough teams.", true);
        } else if (invalid) {
            modalFunctions.setModal("You gave invalid team numbers. Please revise and try again.", true);
        } else {
            dialogFunctions.setDialog({body: "Simulating...", confirmFunction: () => {}});
            await sleep(250);

            var simulator = new Simulator(
                inputRedTeams,
                inputBlueTeams, 
                {
                    simulations, 
                    applyDefense: useDefense, 
                }
            );

            // Run the simulation!
            simulator.run(results => {
                // Simulator is done
                console.log(results);
                dialogFunctions.hideDialog();
                modalFunctions.setModal("Simulation complete!", false)
                navigate("/analysis/viewer", {state: { results }});
            });
        }
    };

    // Prefills based on schedule input
    const getFromSchedule = (num = null) => {
        if (importEventCode == "" || (importMatch == "" && num == null) || localStorage.getItem("schedules") == null) return;

        let matchNumber = Number(num != null ? num : importMatch);
        
        let schedule = JSON.parse(localStorage.getItem("schedules"));
        let didChange = false;
        
        schedule.forEach(event => {
            if (event.code == importEventCode) event.matches.forEach(match => {
                if (match.n == matchNumber) {
                    setRedTeams(match.r);
                    setBlueTeams(match.b);
                    prefill = [];
                    configPrefill = false;
                    didChange = true;
                }
            })
        });
        if (!didChange) {
            setRedTeams(["", "", ""]);
            setBlueTeams(["", "", ""]);
        }
    };

    // Runs whenever the playoff prefill box is ticked, OR the seeds of either alliance change
    const setPlayoffPrefill = (value = null, color = null) => {
        if (value === null) {
            setRedTeams(playoffHelper.data.alliances[redAllianceSeed]);
            setBlueTeams(playoffHelper.data.alliances[blueAllianceSeed]);
            
            if (playoffHelper.data.alliances[redAllianceSeed].length > 3 && benchedRedTeam == -1) setBenchedRedTeam(3);
            if (playoffHelper.data.alliances[redAllianceSeed].length < 4) setBenchedRedTeam(-1);
            if (playoffHelper.data.alliances[blueAllianceSeed].length > 3 && benchedBlueTeam == -1) setBenchedBlueTeam(3);
            if (playoffHelper.data.alliances[blueAllianceSeed].length < 4) setBenchedBlueTeam(-1);
        } else {
            // Validate new seed input
            let seed = Number(value);
            if (seed <= 8 && seed >= 1) {
                seed -= 1;
                if (color === "red") {
                    setRedAllianceSeed(seed);
                    setRedTeams(playoffHelper.data.alliances[seed]);
                    if (playoffHelper.data.alliances[seed].length > 3 && benchedRedTeam == -1) setBenchedRedTeam(3);
                    if (playoffHelper.data.alliances[seed].length < 4) setBenchedRedTeam(-1);
                } else {
                    setBlueAllianceSeed(seed);
                    setBlueTeams(playoffHelper.data.alliances[seed]);
                    if (playoffHelper.data.alliances[seed].length > 3 && benchedBlueTeam == -1) setBenchedBlueTeam(3);
                    if (playoffHelper.data.alliances[seed].length < 4) setBenchedBlueTeam(-1);
                }
            }
        }
    };

    // Resets the teams when disabling the playoff prefill feature
    const disablePlayoffPrefill = () => {
        setRedTeams(["", "", ""]);
        setBlueTeams(["", "", ""]);
        setBenchedRedTeam(-1);
        setBenchedBlueTeam(-1);
    }

    return (
        <div className="SCREEN _SimulatorConfig">
            <PageHeader text="Simulator" />
            <div className="content-area">
                <div className="alliance-column">
                    <div className="alliance-cell red">
                        <h3>Red Alliance</h3>
                        { !usePlayoffTeams ? <>
                            <TeamNumberInput
                                index={0}
                                stateVar={redTeams}
                                stateFunc={setRedTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[0] : -1}
                            />
                            <TeamNumberInput
                                index={1}
                                stateVar={redTeams}
                                stateFunc={setRedTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[1] : -1}
                            />
                            <TeamNumberInput
                                index={2}
                                stateVar={redTeams}
                                stateFunc={setRedTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[2] : -1}
                            />
                        </> : <>
                            <Input
                                label="Red Alliance Seed"
                                labelStyle={{ fontWeight: 600 }}
                                onInput={e => setPlayoffPrefill(e.target.value, "red")}
                                prefill={redAllianceSeed + 1}
                            />
                            { redTeams.map((team, ind) => <PlayoffTeamNumber
                                key={ind}
                                number={team}
                                isBenched={ind == benchedRedTeam}
                                benchedSetter={() => setBenchedRedTeam(ind)}
                                showBenchSetting={redTeams.length > 3}
                            /> )}
                        </> }
                    </div>
                    <div className="alliance-cell blue">
                        <h3>Blue Alliance</h3>
                        { ! usePlayoffTeams ? <>
                            <TeamNumberInput
                                index={0}
                                stateVar={blueTeams}
                                stateFunc={setBlueTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[3] : -1}
                            />
                            <TeamNumberInput
                                index={1}
                                stateVar={blueTeams}
                                stateFunc={setBlueTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[4] : -1}
                            />
                            <TeamNumberInput
                                index={2}
                                stateVar={blueTeams}
                                stateFunc={setBlueTeams}
                                teamNumbers={teamNumbers}
                                useTextbox={useTextboxes}
                                prefill={configPrefill ? prefill.t[5] : -1}
                            />
                        </> : <>
                            <Input
                                label="Blue Alliance Seed"
                                labelStyle={{ fontWeight: 600 }}
                                onInput={e => setPlayoffPrefill(e.target.value, "blue")}
                                prefill={blueAllianceSeed + 1}
                            />
                            { blueTeams.map((team, ind) => <PlayoffTeamNumber
                                key={ind}
                                number={team}
                                isBenched={ind == benchedBlueTeam}
                                benchedSetter={() => setBenchedBlueTeam(ind)}
                                showBenchSetting={blueTeams.length > 3}
                            /> )}
                        </> }
                    </div>
                </div>
                <div className="settings-column">
                    <h2>Settings</h2>
                    { !usePlayoffTeams &&
                        <Input
                            label="Use text boxes for team inputs"
                            isCheckbox
                            onInput={ e => setUseTextboxes(e.target.checked) }
                        />
                    }
                    { localStorage.getItem("schedules") !== null && <Input
                        label="Import match from schedule"
                        isCheckbox
                        onInput={ e => {
                            if (e.target.checked) {
                                setUsePlayoffTeams(false);
                                disablePlayoffPrefill();
                            }
                            setUseMatchImport(e.target.checked);
                        }}
                    /> }
                    { (playoffHelper.data.state == PlayoffHelperState.LIVE_PLAYOFFS || playoffHelper.data.state == PlayoffHelperState.SIMULATED_PLAYOFFS) && <Input
                        label="Use playoff teams"
                        isCheckbox
                        onInput={ e => {
                            if (e.target.checked) {
                                setUseMatchImport(false);
                                setPlayoffPrefill();
                            }
                            setUsePlayoffTeams(e.target.checked);
                        }}
                    /> }
                    { useMatchImport && <>
                        <Input
                            label="Event code"
                            prefill={ localStorage.getItem("EventCodePrefill") || "" }
                            onInput={ e => { setImportEventCode(e.target.value); } }
                        />
                        <Input
                            label="Match #"
                            onInput={ e => { setImportMatch(e.target.value); getFromSchedule(e.target.value) } }
                        />
                    </> }
                    <div className="divider-line"></div>
                    <Input
                        label="# of simulations"
                        onInput={e => setSimulations(Number(e.target.value))}
                        prefill={configPrefill ? prefill.sims : simulations}
                    />
                    <Input
                        label="Simulate defense"
                        isCheckbox={true}
                        prefill={configPrefill ? prefill.def : false}
                        onInput={ e => setUseDefense(e.target.checked) }
                    />
                    <Button
                        text="Run simulation"
                        action={verifySettings}
                    />
                </div>
            </div>
        </div>
    )
}

function TeamNumberInput({ index, stateVar, stateFunc, teamNumbers, useTextbox, prefill = -1 }) {

    // const [teamNumber, setTeamNumber] = useState(prefill == -1 ? "" : prefill);
    const [teamName, setTeamName] = useState(prefill == -1 ? "" : getTeamName(Number(prefill)));
    const [validNumber, setValidNumber] = useState(true);   // does not mean field isn't blank!

    // Generate label-value pair array to use
    let optionValues = [];
    teamNumbers.forEach(num => { optionValues.push({ label: num.toString(), value: num }); });

    const updateTeamNumber = num => {
        let newStateVar = [];
        stateVar.forEach(num => newStateVar.push(num));
        newStateVar[index] = num;
        stateFunc(newStateVar);
    }

    // Execute every time the number is changed
    const checkTeamNumber = (num, updateState = true) => {
        if (teamNumbers.indexOf(Number(num)) == -1) {
            setValidNumber(false);
            setTeamName("???");
            //if (updateState) updateTeamNumber("");
        } else {
            setValidNumber(true);
            setTeamName(getTeamName(Number(num)));
            if (updateState) updateTeamNumber(Number(num));
        }
    }

    const numberInput = e => {
        checkTeamNumber(e.target.value);
    }

    useEffect(() => {
        checkTeamNumber(stateVar[index], false);
    }, [teamNumbers])

    return (
        <div className="_TeamNumberInput">
            { useTextbox ?
                <Input
                    style={{
                        width: 52,
                        marginRight: 8,
                        display: "inline-block"
                    }}
                    marginBottom={0}
                    warning={!validNumber}
                    onInput={numberInput}
                    prefill={stateVar[index]}
                    externalUpdate={stateVar}
                    getExternalUpdate={() => stateVar[index]}
                />
            :
                <Input
                    optionList={optionValues}
                    style={{
                        width: 96,
                        marginRight: 8,
                        display: "inline-block"
                    }}
                    marginBottom={0}
                    onInput={numberInput}
                    prefill={stateVar[index]}
                    externalUpdate={stateVar}
                    getExternalUpdate={() => stateVar[index]}
                />
            }
            <div className="team-name-label">
                {teamName}
            </div>
        </div>
    )
}

function PlayoffTeamNumber({ number, isBenched = false, benchedSetter, showBenchSetting = false }) {
    return (
        <div className="_PlayoffTeamNumber">
            <div className={`number ${isBenched ? "benched" : ""}`}>{number}<span className="team-name"> - { getTeamName(number) }</span></div>
            { (showBenchSetting && !isBenched) && <div className="bench-button" onClick={benchedSetter}>Sit out</div> }
        </div>
    )
}