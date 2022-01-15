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
                    id="Form_defense"
                    onInput={determineDefenseVisibility}
                />
                { defenseVisible && (<> 
                    <Input
                        label="Rate defensive performance"
                        id="Form_defenseRating"
                        optionList={[
                            { value: "bad", label: "Poor: Robot did not disrupt opponent scoring" },
                            { value: "good", label: "Strong: Robot significantly disrupted scoring" }
                        ]}
                    />
                    <Input
                        label="Explain defensive strategy"
                        id="Form_defenseExplain"
                    />
                </>) }
            </>) }

            { typeof inputs.EndgameSection !== "undefined" && ( <>
                <h2>Endgame</h2>
                <inputs.EndgameSection /> 
            </>) }
        </div>
    )
}