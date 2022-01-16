import React, { useState } from 'react';
import Input from '../Input';
import './style.scss';

export default function GameDataSection({inputs}) {
    const [defenseVisible, setDefenseVisible] = useState(false);
    const determineDefenseVisibility = e => {
        setDefenseVisible(e.target.checked);
    }

    return (
        <div className="_GameDataSection">
            { typeof inputs.AutonomousSection !== "undefined" && ( <>
                <h2>Autonomous</h2>
                <inputs.AutonomousSection /> 
            </>) }

            <h2>Teleop</h2>
            <inputs.TeleopSection />

            { inputs.defenseFields && (<>
                <h2>Defense</h2>
                <Input
                    label="This team played defense"
                    isCheckbox={true}
                    id="Form_defense_played"
                    onInput={determineDefenseVisibility}
                />
                { defenseVisible && (<> 
                    <Input
                        label="Rate defensive performance"
                        id="Form_defense_rating"
                        optionList={[
                            { value: "bad", label: "Poor: Robot did not disrupt opponent scoring" },
                            { value: "good", label: "Strong: Robot significantly disrupted scoring" }
                        ]}
                        required={true}
                    />
                    <Input
                        label="Explain defensive strategy"
                        id="Form_defense_explain"
                        required={true}
                    />
                </>) }
            </>) }

            { typeof inputs.EndgameSection !== "undefined" && ( <>
                <h2>Endgame</h2>
                <inputs.EndgameSection /> 
            </>) }

            <h2>Notes</h2>
            <inputs.NotesSection />
            <Input
                label="This team's robot tipped over, broke down, OR lost communications during the match"
                isCheckbox={true}
                id="Form_notes_broken"
            />
            <Input
                label="This team was heavily penalized OR was assessed a yellow/red card during the match"
                isCheckbox={true}
                id="Form_notes_fouls"
            />
            <Input
                label="Comments"
                id="Form_notes_comments"
            />
        </div>
    )
}