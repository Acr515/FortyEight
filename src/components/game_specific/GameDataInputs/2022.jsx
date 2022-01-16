import React from 'react';
import Input from '../../Input';
import { EndgameResult } from '../../../data/game_specific/performanceObject/2022';

/**
 * An array that stores all categories as strings that have data
 */
export const GameDataCategories = [
    "auto", "teleop", "endgame"
]

/**
 * A collection of JSX elements that contain the input elements for the game. Also contains a property, `defenseFields`,
 * that is only true if the game allows defense to be played, warranting the display of the defense input fields
 */
export const GameDataInputs = {
    AutonomousSection: () => <>
        <Input
            label="Taxi"
            id="Form_auto_taxi"
            isCheckbox={true}
        />
        <Input
            label="Low goal"
            id="Form_auto_cargoLow"
            isNumerical={true}
        />
        <Input
            label="High goal"
            id="Form_auto_cargoHigh"
            isNumerical={true}
        />
    </>,
    TeleopSection: () => <>
        <Input
            label="Low goal"
            id="Form_teleop_cargoLow"
            isNumerical={true}
        />
        <Input
            label="High goal"
            id="Form_teleop_cargoHigh"
            isNumerical={true}
        />
    </>,
    EndgameSection: () => <>
        <Input
            label="Climb"
            id="Form_endgame_state"
            optionList={[
                { value: EndgameResult.NONE, label: EndgameResult.NONE },
                { value: EndgameResult.LOW_RUNG, label: EndgameResult.LOW_RUNG },
                { value: EndgameResult.MID_RUNG, label: EndgameResult.MID_RUNG },
                { value: EndgameResult.HIGH_RUNG, label: EndgameResult.HIGH_RUNG },
                { value: EndgameResult.TRAVERSAL_RUNG, label: EndgameResult.TRAVERSAL_RUNG },
            ]}
            required={true}
        />
        <Input
            label="Tried to climb but failed?"
            id="Form_endgame_failedAttempt"
            isCheckbox={true}
        />
    </>,
    NotesSection: () => <>
        <Input
            label="This team missed a majority of the shots they took"
            id="Form_notes_misses"
            isCheckbox={true}
        />
    </>,
    defenseFields: true
}