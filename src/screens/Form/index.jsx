import React from 'react';
import { Link } from 'react-router-dom';

export default function Form() {
    return (
        <div>
            <p>This page would show if you were creating a new form</p>
            <Link to="/">Go Back</Link>
        </div>
    );
}