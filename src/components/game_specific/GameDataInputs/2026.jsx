import React, { useState } from 'react';
import Input from 'components/Input';
import { EndgameResult } from 'data/game_specific/performanceObject/2026';

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
            label="Cycles"
            id="Form_auto_cycles"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : undefined}
        />
        <Input
            label="Average fuel shot per cycle"
            id="Form_auto_fuel"
            slider={{
                min: 0,
                max: 40,
                stops: 8,
            }}
            alignLabel='top'
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : 0}
        />
        <Input
            label="Average % accuracy per cycle"
            id="Form_auto_accuracy"
            slider={{
                min: 0,
                max: 100,
                stops: 4,
                suffix: 'percent',
            }}
            alignLabel='top'
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : 50}
        />
        <Input
            label="Climbed to level 1?"
            id="Form_auto_state"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.auto.state : undefined}
        />
    </>,
    TeleopSection: ({edit}) => <>
        <Input
            label="Cycles"
            id="Form_teleop_cycles"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : undefined}
        />
        <Input
            label="Average fuel shot per cycle"
            id="Form_teleop_fuel"
            slider={{
                min: 0,
                max: 40,
                stops: 8,
            }}
            alignLabel='top'
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : 0}
        />
        <Input
            label="Average % accuracy per cycle"
            id="Form_teleop_accuracy"
            slider={{
                min: 0,
                max: 100,
                stops: 4,
                suffix: 'percent',
            }}
            alignLabel='top'
            prefill={edit.isEdit ? edit.data.performance.auto.algaeLow : 50}
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
                    { value: EndgameResult.LEVEL_1, label: EndgameResult.LEVEL_1 },
                    { value: EndgameResult.LEVEL_2, label: EndgameResult.LEVEL_2 },
                    { value: EndgameResult.LEVEL_3, label: EndgameResult.LEVEL_3 },
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
    NotesSection: () => null,
    defenseFields: false,
};