import React from "react";
import "./style.scss";

export default function PlayoffHelperTeamCell({ value, place, label }) {
    return (
        <div className="_PlayoffHelperTeamCell">
            <div className="value-holder">
                <div className="inline-entry value">{value}</div>
                <div className="inline-entry place">{place}</div>
            </div>
            <div className="label">{label}</div>
        </div>
    )
}