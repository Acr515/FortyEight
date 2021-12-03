import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function FRAME() {
    return (
        <div>
            <p>Navigation</p>
            <Outlet />
        </div>
    );
}