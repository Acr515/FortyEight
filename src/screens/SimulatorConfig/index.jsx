import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import PageHeader from "../../components/PageHeader";
import DialogBoxContext from "../../context/DialogBoxContext";
import FeedbackModalContext from "../../context/FeedbackModalContext";
import Simulator from "../../data/game_specific/Simulator/_Universal";
import getTeamName from "../../data/getTeamName";
import { getTeamNumberArray } from "../../data/SearchData";
import TeamData from "../../data/TeamData";
import sleep from "../../util/sleep";
import './style.scss';

export default function SimulatorConfig() {
    const modalFunctions = useContext(FeedbackModalContext);
    const dialogFunctions = useContext(DialogBoxContext);
    const location = useLocation();
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


    const [useTextboxes, setUseTextboxes] = useState(false);
    const [simulations, setSimulations] = useState(configPrefill ? prefill.sims : 1000);
    const [importEventCode, setImportEventCode] = useState("");
    const [importMatch, setImportMatch] = useState("");

    const teamNumbers = getTeamNumberArray(TeamData);
    const [redTeams, setRedTeams] = useState(configPrefill ? [prefill.t[0], prefill.t[1], prefill.t[2]] : [0, 0, 0]);
    const [blueTeams, setBlueTeams] = useState(configPrefill ? [prefill.t[3], prefill.t[4], prefill.t[5]] : [0, 0, 0]);

    const verifySettings = async () => {
        let incomplete = false, invalid = false;

        const validateNum = num => {
            if (teamNumbers.indexOf(num) == -1) invalid = true;
            if (Number(num) == 0) incomplete = true;
        }
        redTeams.forEach(num => validateNum(num));
        blueTeams.forEach(num => validateNum(num));

        if (incomplete) {
            modalFunctions.setModal("You did not provide enough teams.", true);
        } else if (invalid) {
            modalFunctions.setModal("You gave invalid team numbers. Please revise and try again.", true);
        } else {
            dialogFunctions.setDialog({body: "Simulating...", confirmFunction: () => {}});
            await sleep(250);

            var simulator = new Simulator(redTeams, blueTeams, simulations, false, TeamData);

            // Run the simulation!
            simulator.run(results => {
                // Simulator is done
                console.log(results);
                dialogFunctions.hideDialog();
                modalFunctions.setModal("Simulation complete!", false)
                navigate("/analysis/viewer", {state: {results}});
            }, progress => {
                // Still waiting
                //console.log(progress);
            });
        }
    }

    // Prefills based on schedule input
    const getFromSchedule = async () => {
        if (importEventCode == "" || importMatch == "" || localStorage.getItem("schedules") == null) return;

        await sleep(250);
        let matchNumber = Number(importMatch);
        
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
            setRedTeams([0, 0, 0]);
            setBlueTeams([0, 0, 0]);
        }
    }

    return (
        <div className="SCREEN _SimulatorConfig">
            <PageHeader text="Simulator" />
            <div className="content-area">
                <div className="alliance-column">
                    <div className="alliance-cell red">
                        <h3>Red Alliance</h3>
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
                    </div>
                    <div className="alliance-cell blue">
                        <h3>Blue Alliance</h3>
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
                    </div>
                </div>
                <div className="settings-column">
                    <h2>Settings</h2>
                    <Input
                        label="Use text boxes for team inputs"
                        isCheckbox={true}
                        onInput={ e => setUseTextboxes(e.target.checked) }
                    />
                    <Input
                        label="Event code for auto-import"
                        onInput={ e => { setImportEventCode(e.target.value); getFromSchedule() } }
                    />
                    <Input
                        label="Match # for auto-import"
                        onInput={ e => { setImportMatch(e.target.value); getFromSchedule() } }
                    />
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

function TeamNumberInput({index, stateVar, stateFunc, teamNumbers, useTextbox, prefill = -1}) {

    const [teamNumber, setTeamNumber] = useState(prefill == -1 ? "" : prefill);
    const [teamName, setTeamName] = useState(prefill == -1 ? "" : getTeamName(Number(prefill)));
    const [validNumber, setValidNumber] = useState(true);   // does not mean field isn't blank!

    // Generate label-value pair array to use
    let optionValues = [];
    teamNumbers.forEach(num => { optionValues.push({ label: num.toString(), value: num }); });

    useEffect(() => {
        checkTeamNumber({target: {value: stateVar[index]}});
    }, [stateVar])

    // Execute every time the number is changed
    const checkTeamNumber = e => {
        let num = e.target.value;
        if (num == teamNumber) return;
        if (teamNumbers.indexOf(Number(num)) == -1) {
            setValidNumber(false);
            setTeamName("???");
            setTeamNumber("");
        } else {
            setTeamNumber(Number(e.target.value));
            setValidNumber(true);
            setTeamName(getTeamName(Number(e.target.value)));
            
            // Create a new team array based on stateVar
            let newStateVar = [];
            stateVar.forEach(num => newStateVar.push(num));
            newStateVar[index] = Number(e.target.value);
            stateFunc(newStateVar);
        }
    }

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
                    onInput={checkTeamNumber}
                    prefill={teamNumber}
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
                    onInput={checkTeamNumber}
                    prefill={teamNumber}
                />
            }
            <div className="team-name-label">
                {teamName}
            </div>
        </div>
    )
}