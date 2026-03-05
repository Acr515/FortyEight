import React, { useState } from 'react';
import Input from 'components/Input';
import Events from 'data/game_specific/eventCodes/GAME_YEAR';
import { findEvent } from 'data/game_specific/eventCodes/_Universal';
import GlobalSettingsInputs from 'components/game_specific/GlobalSettingsInputs';
import gameDataObject from 'util/gameData/GAME_YEAR';
import './style.scss';

export default function Home() {

    // Set up localStorage for event code and name
    if (localStorage.getItem("ScoutNamePrefill") == null) localStorage.setItem("ScoutNamePrefill", "");
    if (localStorage.getItem("EventCodePrefill") == null) localStorage.setItem("EventCodePrefill", "");

    const [prefillName, setPrefillName] = useState(localStorage.getItem("ScoutNamePrefill"));
    const [prefillKey, setPrefillKey] = useState(localStorage.getItem("EventCodePrefill"));
    const [eventName, setEventName] = useState("Type an event code to see its name here");

    const updateData = (newString, idString) => {
        if (idString == "EventCodePrefill") {
            setPrefillKey(newString);
            let event = findEvent(Events, newString);
            if (event == null) setEventName("???"); else setEventName(event.name + " | Week " + (event.week + 1));
        }
        localStorage.setItem(idString, newString);
    };

    const GameSpecificSettings = GlobalSettingsInputs[gameDataObject.year] ?? null;

    return (
        <div className="SCREEN _Home">
            <h1>Welcome to FortyEight FRC Scouter</h1>
            <p>Click an option to the left to get started. Use the inputs below to prefill each form with information.</p>
            <div className="prefill-form">
                <Input
                    onInput={e => updateData(e.target.value, "ScoutNamePrefill")}
                    label="Your name"
                    prefill={localStorage.getItem("ScoutNamePrefill")}
                />
                <Input
                    onInput={e => updateData(e.target.value, "EventCodePrefill")}
                    label="Event key"
                    prefill={localStorage.getItem("EventCodePrefill")}
                />
                <div className="event-code-preview">
                    {eventName}
                </div>
                { GameSpecificSettings !== null && <>
                    <h2>{gameDataObject.name} Specific Settings</h2>
                    <GameSpecificSettings />
                </>}
            </div>
        </div>
    );
}