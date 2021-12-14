import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import calculateRPI from '../../data/game_specific/calculateRPI/202X';
import TeamData from '../../data/TeamData';
import './style.scss';

export default function Teams() {
    return (
        <div className="SCREEN _Teams">
            <PageHeader text="Teams" />
            <div className="team-list">
                {
                    TeamData.map(team => {
                        return (<Team team={team} key={team.number} />)
                    })
                }
            </div>
        </div>
    );
}

function Team({team}) {
    const [openTab, setOpenTab] = useState(false);

    const toggleTab = () => {
        setOpenTab(!openTab);
    }

    return (
        <div className="team-component">
            <div 
                className="team-tab"
                onClick={toggleTab}
                style={openTab ? {width: 120} : {}}
            ></div>
            <div className="module-container">
                <Link className="item-module link" to={"/teams/" + team.number}>
                    <span className="number team">{team.number}</span>
                    <span className="label">{team.name}</span>
                </Link>
                <div className="item-module short">
                    <span className="number">{calculateRPI(team)}</span>
                    <span className="label">RPI</span>
                </div>
                <div className="item-module short">
                    <span className="number">{team.data.length}</span>
                    <span className="label">Forms</span>
                </div>
            </div>
        </div>
    )
}