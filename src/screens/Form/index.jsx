import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import GameDataSection from '../../components/GameDataSection';
import { GameDataInputs } from '../../components/game_specific/GameDataInputs/2021';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import './style.scss';

export default function Form() {
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
                    />
                    <span className="team-name">Invalid team number</span>
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
                    />
                </div>
            </div>
            <div className="form-area">
                <GameDataSection inputs={GameDataInputs}/>
            </div>
        </form>
    );
}