import React from 'react';
import Input from 'components/Input';
import { EndgameResult } from 'data/game_specific/performanceObject/2022';

/**
 * An array that stores all categories as strings that have data
 */
export const GameDataCategories = [
    "auto", "teleop", "endgame"
];

/**
 * A collection of JSX elements that contain the input elements for the game. Also contains a property, `defenseFields`,
 * that is only true if the game allows defense to be played, warranting the display of the defense input fields
 */
export const GameDataInputs = {
    AutonomousSection: ({edit}) => <>
        <Input
            label="Taxi"
            id="Form_auto_taxi"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.auto.taxi : undefined}
        />
        <Input
            label="Low goal"
            id="Form_auto_cargoLow"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.cargoLow : undefined}
        />
        <Input
            label="High goal"
            id="Form_auto_cargoHigh"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.cargoHigh : undefined}
        />
    </>,
    TeleopSection: ({edit}) => <>
        <Input
            label="Low goal"
            id="Form_teleop_cargoLow"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.cargoLow : undefined}
        />
        <Input
            label="High goal"
            id="Form_teleop_cargoHigh"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.cargoHigh : undefined}
        />
    </>,
    EndgameSection: ({edit}) => <>
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
            prefill={edit.isEdit ? edit.data.performance.endgame.state : undefined}
        />
        <Input
            label="Tried to climb but failed?"
            id="Form_endgame_failedAttempt"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.endgame.failedAttempt : undefined}
        />
    </>,
    NotesSection: ({edit}) => <>
        <Input
            label="This team missed a majority of the shots they took"
            id="Form_notes_misses"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.notes.misses : undefined}
        />
    </>,
    defenseFields: true
};