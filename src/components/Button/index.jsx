import React from 'react';
import './style.scss';

export default function Button({text, action, marginTop, marginBottom}) {
    return (
        <div className="_Button" 
            onClick={action}
            style={{ marginTop: marginTop || 24, marginBottom: marginBottom || 6 }}
        >
            <span className="button-label">{text}</span>
        </div>
    )
}