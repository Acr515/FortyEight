import React from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

export default function Home() {
    return (
        <div className="SCREEN _Home">
            <h1>Welcome to FortyEight FRC Scouter</h1>
            <p>Click an option to the left to get started</p>
        </div>
    );
}