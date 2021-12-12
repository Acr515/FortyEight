import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import GameDataForm from '../../components/GameDataForm';
import GameDataInputs from '../../components/game_specific/GameDataInputs/2021';
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
                        id="Form_teamno"
                        marginBottom={4}
                    />
                    <span className="team-name">Team name shows here!</span>
                    <Input
                        label="Match #"
                        id="Form_matchno"
                    />
                    <Input
                        label="Event Code"
                        id="Form_eventcode"
                    />
                    <Button
                        text="Submit"
                    />
                </div>
            </div>
            <div className="form-area">
                <GameDataInputs />
            </div>
        </form>
    );
}