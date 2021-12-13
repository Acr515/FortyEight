import React from 'react';
import './style.scss';

export default function GameDataSection({inputs}) {
    return (
        <div className="_GameDataSection">
            <h2>Teleop</h2>
            <inputs.TeleopSection />
        </div>
    )
}