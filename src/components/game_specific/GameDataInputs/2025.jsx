import React, { useState } from 'react';
import Input from 'components/Input';
import { EndgameResult } from 'data/game_specific/performanceObject/2025';

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
        <h3>Algae</h3>
        <Input
            label="Algae in Processor (Low)"
            id="Form_auto_algaeLow"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : undefined}
        />
        <Input
            label="Algae in Net (High)"
            id="Form_auto_algaeHigh"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.algaeHigh : undefined}
        />
        <h3>Coral</h3>
        <Input
            label="Coral in Trough (Level 1)"
            id="Form_auto_coralL1"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.coralL1 : undefined}
        />
        <Input
            label="Coral on Level 2"
            id="Form_auto_coralL2"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.coralL2 : undefined}
        />
        <Input
            label="Coral on Level 3"
            id="Form_auto_coralL3"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.coralL3 : undefined}
        />
        <Input
            label="Coral on Level 4"
            id="Form_auto_coralL4"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.coralL4 : undefined}
        />
    </>,
    TeleopSection: ({edit}) => <>
        <h3>Algae</h3>
        <Input
            label="Algae in Processor (Low)"
            id="Form_teleop_algaeLow"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.algaeLow : undefined}
        />
        <Input
            label="Algae in Net (High)"
            id="Form_teleop_algaeHigh"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.algaeHigh : undefined}
        />
        <h3>Coral</h3>
        <Input
            label="Coral in Trough (Level 1)"
            id="Form_teleop_coralL1"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.coralL1 : undefined}
        />
        <Input
            label="Coral on Level 2"
            id="Form_teleop_coralL2"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.coralL2 : undefined}
        />
        <Input
            label="Coral on Level 3"
            id="Form_teleop_coralL3"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.coralL3 : undefined}
        />
        <Input
            label="Coral on Level 4"
            id="Form_teleop_coralL4"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.coralL4 : undefined}
        />
    </>,
    EndgameSection: ({edit}) => {
        const [endgameState, setEndgameState] = useState(edit.isEdit ? (edit.data.performance.endgame.state == EndgameResult.HARMONIZED ? EndgameResult.ONSTAGE : edit.data.performance.endgame.state) : undefined);

        return <>
            <Input
                label="Climb"
                id="Form_endgame_state"
                optionList={[
                    { value: EndgameResult.NONE, label: EndgameResult.NONE },
                    { value: EndgameResult.PARK, label: EndgameResult.PARK },
                    { value: EndgameResult.SHALLOW_CAGE, label: EndgameResult.SHALLOW_CAGE },
                    { value: EndgameResult.DEEP_CAGE, label: EndgameResult.DEEP_CAGE },
                ]}
                onInput={e => setEndgameState(e.target.value)}
                required={true}
                prefill={endgameState}
            />
            <Input
                label="Tried to climb but failed?"
                id="Form_endgame_failedAttempt"
                isCheckbox={true}
                prefill={edit.isEdit ? edit.data.performance.endgame.failedAttempt : undefined}
            />
        </>
    },
    NotesSection: ({edit}) => <>
        <Input
            label="This team missed or dropped a majority of the game pieces they attempted to score"
            id="Form_notes_misses"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.notes.misses : undefined}
        />
        <Input
            label="This team picked coral up off the floor"
            id="Form_notes_floorPickup"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.notes.floorPickup : undefined}
        />
    </>,
    defenseFields: true
};