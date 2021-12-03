import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

export default function Home() {
    return (
        <div>
            <p className="usual">This is the home route showing. Below the link is a thing that shows the current route</p>
            <p className="transandina">This is the home route showing. Below the link is a thing that shows the current route</p>
            <Link to="/form">New Form</Link>
        </div>
    );
}