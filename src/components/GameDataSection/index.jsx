import React, { useState } from 'react';
import Input from '../Input';
import './style.scss';

/**
 * Produces the entire right-hand column in the Create form, containing all non-standard information for collection
 * @param {object} inputs An object containing different sets of inputs for different possible games
 * @param {object} edit Used for prefilling forms with information when editing a match
 */
export default function GameDataSection({inputs, edit}) {
    const [defenseVisible, setDefenseVisible] = useState(edit.isEdit ? edit.data.performance.defense.played : false);
    const determineDefenseVisibility = e => {
        setDefenseVisible(e.target.checked);
    }

    return (
        <div className="_GameDataSection">
            { typeof inputs.AutonomousSection !== "undefined" && ( <>
                <h2>Autonomous</h2>
                <inputs.AutonomousSection edit={edit} /> 
            </>) }

            <h2>Teleop</h2>
            <inputs.TeleopSection edit={edit} />

            { inputs.defenseFields && (<>
                <h2>Defense</h2>
                <Input
                    label="This team played defense"
                    isCheckbox={true}
                    id="Form_defense_played"
                    onInput={determineDefenseVisibility}
                    prefill={edit.isEdit ? edit.data.performance.defense.played : undefined}
                />
                { defenseVisible && (<> 
                    <Input
                        label="Rate defensive performance"
                        id="Form_defense_rating"
                        optionList={[
                            { value: "Poor", label: "Poor: Robot did not disrupt opponent scoring" },
                            { value: "Strong", label: "Strong: Robot significantly disrupted scoring" }
                        ]}
                        required={true}
                        prefill={edit.isEdit ? edit.data.performance.defense.rating : undefined}
                    />
                    <Input
                        label="Explain defensive strategy"
                        id="Form_defense_explain"
                        required={true}
                        prefill={edit.isEdit ? edit.data.performance.defense.explain : undefined}
                    />
                </>) }
            </>) }

            { typeof inputs.EndgameSection !== "undefined" && ( <>
                <h2>Endgame</h2>
                <inputs.EndgameSection edit={edit} /> 
            </>) }

            <h2>Notes</h2>
            <inputs.NotesSection edit={edit} />
            <Input
                label="This team's robot tipped over, broke down, OR lost communications during the match"
                isCheckbox={true}
                id="Form_notes_broken"
                prefill={edit.isEdit ? edit.data.performance.notes.broken : undefined}
            />
            <Input
                label="This team was heavily penalized OR was assessed a yellow/red card during the match"
                isCheckbox={true}
                id="Form_notes_fouls"
                prefill={edit.isEdit ? edit.data.performance.notes.fouls : undefined}
            />
            <Input
                label="Comments"
                id="Form_notes_comments"
                prefill={edit.isEdit ? edit.data.performance.notes.comments : undefined}
            />
        </div>
    )
}