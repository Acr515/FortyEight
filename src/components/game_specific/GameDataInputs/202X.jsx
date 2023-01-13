import React from 'react';
import Input from 'components/Input';

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
            label="Auto cross"
            id="Form_auto_cross"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.auto.cross : undefined}
        />
        <Input
            label="Pieces scored"
            id="Form_auto_pieces"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.auto.pieces : undefined}
        />
    </>,
    TeleopSection: ({edit}) => <>
        <Input
            label="Pieces scored"
            id="Form_teleop_pieces"
            isNumerical={true}
            prefill={edit.isEdit ? edit.data.performance.teleop.pieces : undefined}
        />
    </>,
    EndgameSection: ({edit}) => <>
    </>,
    NotesSection: ({edit}) => <>
    </>,
    defenseFields: true
};