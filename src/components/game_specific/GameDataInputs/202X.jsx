import React from 'react';
import Input from '../../Input';

export const GameDataInputs = {
    AutonomousSection: () => {},
    TeleopSection: () => {
        return (
            <>
                <Input
                    label="Pieces scored"
                    id="Form_pieces"
                    isNumerical={true}
                />
                {/*<Input
                    label="Comments"
                    id="Form_comments"
                />*/}
            </>
        )
    },
    EndgameSection: () => {},
    CheckboxSection: () => {}
}