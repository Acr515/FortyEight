import React from 'react';
import Input from 'components/Input';
import { EndgameResult } from 'data/game_specific/performanceObject/2024';

/**
 * An array that stores all categories as strings that have data
 */
export const GameDataCategories = [
    "auto", "teleop", "endgame"
];

/**
 * A dictionary of form inputs that scouts fill with data. The HTML ID of each element is named very carefully:
 *  * The first phrase should be "Form_"
 *  * ... followed by the section of the performance object to populate which will generally be "auto," "teleop," or "endgame," and another score
 *  * ... followed lastly by the scoring section to fill (i.e. if data should go into the "upperGoal" area, that should be the final section of the ID)
 * 
 * Additionally contains a boolean property `defenseFields` that decides whether or not the generic defense fields should appear.
 */
export const GameDataInputs = {
    AutonomousSection: ({edit}) => <>
        <Input
            label="Leave (Autocross)"
            id="Form_auto_leave"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.auto.leave : undefined}
        />
        <Input
            label="Amp Notes (Low)"
            id="Form_auto_amp"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.amp : undefined}
        />
        <Input
            label="Speaker Notes (High)"
            id="Form_auto_speaker"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.speaker : undefined}
        />
    </>,
    TeleopSection: ({edit}) => <>
        <Input
            label="Amp Notes (Low)"
            id="Form_teleop_amp"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.amp : undefined}
        />
        <Input
            label="Speaker Notes (High)"
            id="Form_teleop_speaker"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.speaker : undefined}
        />
    </>,
    EndgameSection: ({edit}) => <>
        <Input
            label="Climb"
            id="Form_endgame_state"
            optionList={[
                { value: EndgameResult.NONE, label: EndgameResult.NONE },
                { value: EndgameResult.PARKED, label: EndgameResult.PARKED },
                { value: EndgameResult.ONSTAGE, label: EndgameResult.ONSTAGE },
                { value: EndgameResult.HARMONIZED, label: EndgameResult.HARMONIZED },
            ]}
            required={true}
            prefill={edit.isEdit ? edit.data.performance.endgame.state : undefined}
        />
        <Input
            label="Scored note in trap?"
            id="Form_endgame_trap"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.endgame.trap : undefined}
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
        <Input
            label="This team picked notes up off the floor"
            id="Form_notes_floorPickup"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.notes.floorPickup : undefined}
        />
    </>,
    defenseFields: true
};