import React from 'react';
import Input from 'components/Input';
import { EndgameResult } from 'data/game_specific/performanceObject/2023';
import './2023.scss';

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
    AutonomousSection: ({edit}) => {
        return <>
            <Input
                label="Mobility"
                id="Form_auto_mobility"
                isCheckbox={true}
                prefill={edit.isEdit ? edit.data.performance.auto.mobility : undefined}
            />
            <Input
                label="Charge Station"
                id="Form_auto_state"
                optionList={[
                    { value: EndgameResult.NONE, label: EndgameResult.NONE },
                    { value: EndgameResult.DOCKED, label: EndgameResult.DOCKED },
                    { value: EndgameResult.DOCKED_AND_ENGAGED, label: EndgameResult.DOCKED_AND_ENGAGED },
                ]}
                required={true}
                prefill={edit.isEdit ? (
                    edit.data.performance.auto.engaged ? EndgameResult.DOCKED_AND_ENGAGED : (
                        edit.data.performance.auto.docked ? EndgameResult.DOCKED : EndgameResult.NONE
                    )
                ) : undefined}
            />
            <h3>Top Node Scoring</h3>
            <Input
                label="Cone - Top"
                id="Form_auto_coneHigh"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.coneHigh : undefined}
            />
            <Input
                label="Cube - Top"
                id="Form_auto_cubeHigh"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.cubeHigh : undefined}
            />
            <h3>Middle Node Scoring</h3>
            <Input
                label="Cone - Middle"
                id="Form_auto_coneMid"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.coneMid : undefined}
            />
            <Input
                label="Cube - Middle"
                id="Form_auto_cubeMid"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.cubeMid : undefined}
            />
            <h3>Bottom Node Scoring</h3>
            <Input
                label="Cone - Bottom"
                id="Form_auto_coneLow"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.coneMid : undefined}
            />
            <Input
                label="Cube - Bottom"
                id="Form_auto_cubeLow"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.auto.cubeMid : undefined}
            />
        </>
    },
    TeleopSection: ({edit}) => <>
        <h3>Top Node Scoring</h3>
            <Input
                label="Cone - Top"
                id="Form_teleop_coneHigh"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.coneHigh : undefined}
            />
            <Input
                label="Cube - Top"
                id="Form_teleop_cubeHigh"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.cubeHigh : undefined}
            />
            <h3>Middle Node Scoring</h3>
            <Input
                label="Cone - Middle"
                id="Form_teleop_coneMid"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.coneMid : undefined}
            />
            <Input
                label="Cube - Middle"
                id="Form_teleop_cubeMid"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.cubeMid : undefined}
            />
            <h3>Bottom Node Scoring</h3>
            <Input
                label="Cone - Bottom"
                id="Form_teleop_coneLow"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.coneLow : undefined}
            />
            <Input
                label="Cube - Bottom"
                id="Form_teleop_cubeLow"
                isNumerical={true}
                prefill={edit.isEdit ? edit.data.performance.teleop.cubeLow : undefined}
            />
    </>,
    EndgameSection: ({edit}) => <>
        <Input
            label="Charge Station"
            id="Form_endgame_state"
            optionList={[
                { value: EndgameResult.NONE, label: EndgameResult.NONE },
                { value: EndgameResult.PARKED, label: EndgameResult.PARKED },
                { value: EndgameResult.DOCKED, label: EndgameResult.DOCKED },
                { value: EndgameResult.DOCKED_AND_ENGAGED, label: EndgameResult.DOCKED_AND_ENGAGED },
            ]}
            required={true}
            prefill={edit.isEdit ? edit.data.performance.endgame.state : undefined}
        />
        <Input
            label="Tried to dock but failed?"
            id="Form_endgame_failedAttempt"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.endgame.failedAttempt : undefined}
        />
    </>,
    NotesSection: ({edit}) => <>
        <Input
            label="This team dropped a majority of the game pieces they grabbed"
            id="Form_notes_misses"
            isCheckbox={true}
            prefill={edit.isEdit ? edit.data.performance.notes.misses : undefined}
        />
    </>,
    defenseFields: true
};