import React from 'react';
import Input from 'components/Input';

/**
 * An array that stores all categories as strings that have data
 */
export const GameDataCategories = [
    "auto", "teleop", "endgame"
];

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
    TeleopSection: () => {
        return (
            <>
                <Input
                    label="Pieces scored"
                    id="Form_pieces"
                    isNumerical={true}
                />
            </>
        )
    },
    EndgameSection: ({edit}) => <>
    </>,
    NotesSection: ({edit}) => <>
    </>,
    defenseFields: true
};