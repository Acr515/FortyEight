import React, { useState } from 'react';
import Input from 'components/Input';

const defaultSettings = {
    stops: {
        autoFuel: "8",
        autoAccuracy: "4", 
        teleopFuel: "12",
        teleopAccuracy: 8, 
    }
};

export default function GlobalSettingsInputs() {
    // Set up localStorage for event code and name
    if (localStorage.getItem("InputSettings") == null) localStorage.setItem("InputSettings", JSON.stringify(defaultSettings));

    const initialSettings = JSON.parse(localStorage.getItem("InputSettings"));
    const [settings, setSettings] = useState(initialSettings);
    const [separatePhases, setSeparatePhases] = useState(settings.stops.autoFuel !== settings.stops.teleopFuel && settings.stops.autoAccuracy !== settings.stops.teleopAccuracy)

    /**
     * Runs on every update of an input field. Saves the value of the input to `localStorage`.
     * @param {string} value The value received.
     * @param {string[]} keys The `stops` object keys to write to.
     */
    const onUpdate = (value, keys) => {
        const newSettings = {...settings};

        for (const key of keys) {
            newSettings.stops[key] = Number(value);
        }

        overwriteSettings(newSettings);
    };

    const overwriteSettings = (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem("InputSettings", JSON.stringify(newSettings));
    }

    const onCheckUpdate = (e) => {
        if (!e.target.checked) {
            const newSettings = {
                stops: {
                    ...settings.stops,
                    teleopFuel: settings.stops.autoFuel,
                    teleopAccuracy: settings.stops.autoAccuracy,
                }
            }

            overwriteSettings(newSettings);
        }
        setSeparatePhases(e.target.checked);
    };

    /** Common-sense validation */
    const isValid = (val) => Number(val) == val && val > 3 && val < 20;

    return <>
        <Input
            onInput={e => onUpdate(e.target.value, ["autoFuel", ...(!separatePhases ? ["teleopFuel"] : [])])}
            label={`# of stops along the ${separatePhases ? 'Auto ' : ''}Fuel slider`}
            prefill={initialSettings.stops.autoFuel}
            warning={!isValid(settings.stops.autoFuel)}
        />
        <Input
            onInput={e => onUpdate(e.target.value, ["autoAccuracy", ...(!separatePhases ? ["teleopAccuracy"] : [])])}
            label={`# of stops along the ${separatePhases ? 'Auto ' : ''}Accuracy slider`}
            prefill={initialSettings.stops.autoAccuracy}
            warning={!isValid(settings.stops.autoAccuracy)}
        />
        <Input
            onInput={onCheckUpdate}
            label='Different number of stops during teleop?'
            prefill={separatePhases}
            isCheckbox
        />
        { separatePhases && <>
            <Input
                onInput={e => onUpdate(e.target.value, ["teleopFuel"])}
                label={`# of stops along the Teleop Fuel slider`}
                prefill={initialSettings.stops.teleopFuel}
                warning={!isValid(settings.stops.teleopFuel)}
            />
            <Input
                onInput={e => onUpdate(e.target.value, ["teleopAccuracy"])}
                label={`# of stops along the Teleop Accuracy slider`}
                prefill={initialSettings.stops.teleopAccuracy}
                warning={!isValid(settings.stops.teleopAccuracy)}
            />
        </>}
    </>;
}