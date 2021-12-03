import React from 'react';
import { Link } from 'react-router-dom';
import GameDataForm from '../../components/GameDataForm';
import GameDataInputs from '../../components/game_specific/GameDataInputs/2021';

export default function Form() {
    return (
        <div>
            <h1>Create Data</h1>
            <GameDataForm inputs={GameDataInputs}/>
            <Link to="/">Go Back</Link>
        </div>
    );
}