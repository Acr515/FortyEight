import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './style.scss';

export default function FRAME() {
    const location = useLocation();

    return (
        <div id="app-container">
            <div id="navigation-bar">
                <NavigationLink
                    link="/teams"
                    text="Teams"
                    location={location}
                />
                <NavigationLink
                    link="/test"
                    text="Data"
                    location={location}
                />
            </div>
            <Outlet id="content-container"/>
        </div>
    );
}

function NavigationLink({link, text, location}) {
    return (
        <Link to={link} className={location.pathname.includes(link) ? "navigation-link active" : "navigation-link"}>
            {text}
        </Link>
    )
}