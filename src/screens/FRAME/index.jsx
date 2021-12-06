import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './style.scss';

export default function FRAME() {
    return (
        <div id="app-container">
            <div id="navigation-bar">
                <NavigationLink
                    link="/teams"
                    text="Teams"
                    active={true}
                />
                <NavigationLink
                    link="/"
                    text="Data"
                />
                <NavigationLink
                    link="/"
                    text="Export"
                />
            </div>
            <Outlet id="content-container"/>
        </div>
    );
}

function NavigationLink({link, text, active}) {
    return (
        <Link to={link} className={active ? "navigation-link active" : "navigation-link"}>
            {text}
        </Link>
    )
}