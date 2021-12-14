import React from "react";
import { useParams } from "react-router";
import { getTeamData } from "../../data/SearchData";

export default function ViewTeam() {
    const params = useParams();
    const teamNumber = params.number;
    var team = getTeamData(teamNumber);

    return (
        <div className="SCREEN _ViewTeam">
            <h1>{teamNumber}</h1>
        </div>
    )
}