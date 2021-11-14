import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div>
            <p>This is the home route showing</p>
            <Link to="/form">New Form</Link>
        </div>
    );
}