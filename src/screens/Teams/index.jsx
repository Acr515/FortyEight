import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import './style.scss';

export default function Teams() {
    return (
        <div className="SCREEN _Teams">
            <PageHeader text="Teams" />
            <div className="team-list">
                <Team number={4855}/>
                <Team number={1254}/>
            </div>
        </div>
    );
}

function Team({number}) {
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
                <Link className="item-module" to="/">
                    <span className="number team">{number}</span>
                    <span className="label">Team Name</span>
                </Link>
                <div className="item-module short">
                    <span className="number">10.0</span>
                    <span className="label">RPI</span>
                </div>
                <div className="item-module short">
                    <span className="number">5</span>
                    <span className="label">Forms</span>
                </div>
            </div>
        </div>
    )
}