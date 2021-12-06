import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function FRAME() {
    return (
        <div id="app-container">
            <div id="navigation-bar">
                <p>Navigation</p>
            </div>
            <Outlet />
        </div>
    );
}