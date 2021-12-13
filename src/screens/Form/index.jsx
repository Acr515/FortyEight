import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TeamData, { createFormObject, createTeamObject } from '../../data/TeamData';
import Button from '../../components/Button';
import GameDataSection from '../../components/GameDataSection';
import { GameDataInputs } from '../../components/game_specific/GameDataInputs/2021';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import './style.scss';
import { teamExists } from '../../data/SearchData';
import getTeamName from '../../data/getTeamName';

export default function Form() {

    const [fullTeamName, setFullTeamName] = useState("Team name will show here");

    const getFullTeamName = e => {
        if (e.target.value !== "") setFullTeamName(getTeamName(e.target.value)); else setFullTeamName("Team name will show here");
    }

    const getValue = id => {
        id = "Form_" + id;
        return typeof document.getElementById(id) === "undefined" ? null : document.getElementById(id).value;
    }

    const submitForm = () => {
        let teamNumber = getValue("teamNumber");
        if (!teamExists(teamNumber)) TeamData.push(createTeamObject(teamNumber));
    }

    return (
        <form className="SCREEN _Form">
            <div className="constant-area">
                <PageHeader text="Create" />
                <div className="constant-control-container">
                    <Input
                        label="Name"
                        id="Form_name"
                    />
                    <Input
                        label="Team #"
                        id="Form_teamNumber"
                        marginBottom={4}
                        onInput={getFullTeamName}
                    />
                    <span className="team-name">{fullTeamName}</span>
                    <Input
                        label="Match #"
                        id="Form_matchNumber"
                    />
                    <Input
                        label="Event Code"
                        id="Form_eventCode"
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