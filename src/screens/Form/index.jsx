import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeamData, { createFormObject, createTeamObject } from '../../data/TeamData';
import Button from '../../components/Button';
import GameDataSection from '../../components/GameDataSection';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import './style.scss';
import { getTeamData, teamExists } from '../../data/SearchData';
import getTeamName from '../../data/getTeamName';
import FeedbackModalContext from '../../context/FeedbackModalContext';
import { saveData } from '../../data/saveLoadData';
import { GameDataInputs } from '../../components/game_specific/GameDataInputs/2022';
import performanceObject from '../../data/game_specific/performanceObject/2022';


export default function Form() {

    const [fullTeamName, setFullTeamName] = useState("Team name will show here");
    const navigate = useNavigate();
    const modalFunctions = useContext(FeedbackModalContext);

    const getFullTeamName = e => {
        if (e.target.value !== "") setFullTeamName(getTeamName(e.target.value)); else setFullTeamName("Team name will show here");
    }

    const getValue = id => {
        return typeof document.getElementById(id) === "undefined" ? null : document.getElementById(id).value;
    }

    const submitForm = () => {
        let teamNumber = getValue("Form_base_teamNumber");
        if (!teamExists(teamNumber)) TeamData.push(createTeamObject(teamNumber));

        // Validate the form
        let valid = true;
        document.querySelectorAll(".SCREEN._Form .input").forEach(elm => {
            if (elm.classList.contains("required") && elm.value == "") valid = false;
        });
        if (!valid) {
            modalFunctions.setModal("A required field was left blank. Please check your response and try again.", true);
            return;
        }

        // Create universal form data
        let form = createFormObject();
        form.teamNumber = Number(teamNumber);
        form.name = getValue("Form_base_name");
        form.matchNumber = Number(getValue("Form_base_matchNumber"));
        form.eventCode = getValue("Form_base_eventCode");

        // Now assign data to form.performance, based on the year
        let performance = performanceObject();
        document.querySelectorAll(".SCREEN._Form .input").forEach(elm => {
            let name = elm.id.split("_");
            if (name[1] != "base") {
                if (elm.classList.contains("numerical")) 
                    performance[name[1]][name[2]] = Number(elm.value);
                else if (elm.type == "checkbox") 
                    performance[name[1]][name[2]] = elm.value == "true";
                else
                    performance[name[1]][name[2]] = elm.value;
            }
        });
        form.performance = performance;
        getTeamData(teamNumber).data.push(form);

        modalFunctions.setModal("Your data was successfully submitted!", false);
        saveData();
        navigate("/teams");
    }

    return (
        <form className="SCREEN _Form">
            <div className="constant-area">
                <PageHeader text="Create" />
                <div className="constant-control-container">
                    <Input
                        label="Name"
                        id="Form_base_name"
                        required={true}
                    />
                    <Input
                        label="Team #"
                        id="Form_base_teamNumber"
                        marginBottom={4}
                        onInput={getFullTeamName}
                        required={true}
                    />
                    <span className="team-name">{fullTeamName}</span>
                    <Input
                        label="Match #"
                        id="Form_base_matchNumber"
                        required={true}
                    />
                    <Input
                        label="Event Code"
                        id="Form_base_eventCode"
                        required={true}
                    />
                    <Button
                        text="Submit"
                        action={submitForm}
                    />
                </div>
            </div>
            <div className="form-area">
                <GameDataSection inputs={GameDataInputs}/>
            </div>
        </form>
    );
}