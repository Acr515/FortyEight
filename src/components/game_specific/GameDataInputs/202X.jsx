import React from 'react';
import Input from '../../Input';

export const GameDataInputs = {
    AutonomousSection: () => { 
        return (
            <>
                <Input
                    label="Auto cross"
                    id="Form_autonCross"
                    isCheckbox={true}
                />
                <Input
                    label="Pieces scored"
                    id="Form_autonPieces"
                    isNumerical={true}
                />
            </>
        ) 
    },
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
    EndgameSection: () => { 
        return (
            <>
            
            </>
        )
    },
    CheckboxSection: () => {},
    defenseFields: true
}