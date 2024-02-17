import React, { useState, useContext } from 'react';
import PageHeader from 'components/PageHeader';
import TeamData from 'data/TeamData';
import './style.scss';
import { Weights } from 'data/game_specific/weighTeam/2023';

/**
 * A team analyzer used to weigh teams by their strengths and eliminate teams that may have
 * been selected by another playoff alliance
 */
export default function TeamAnalyzer() {
    const weightedTeams = TeamData;
    const [weights, setWeights] = useState()

    return (
        <div className="SCREEN _TeamAnalyzer">
            <div className="header-section">
                <PageHeader text="Team Analyzer" />
            </div>
            <div className="team-list">
                {
                    weightedTeams.length > 0 ? weightedTeams.map(team => {
                        return (<AnalyzedEntry team={team} key={team.number} />)
                    }) : (
                        <p className="text">
                            You have no team data to analyze.
                        </p>
                    )
                }
            </div>
        </div>
    );
}

function AnalyzedEntry({ team }) {

    return (
        <div className="team-component">
        </div>
    )
}