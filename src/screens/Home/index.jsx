import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default function Home() {
    return (
        <div>
            <p>This is a test of the index route</p>
            <Link to="/form">New Form</Link>
        </div>
    );
}