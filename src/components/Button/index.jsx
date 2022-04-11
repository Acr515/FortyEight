import React from 'react';
import './style.scss';

export default function Button({text, action, marginTop, marginBottom, style, useBorder = false}) {
    return (
        <div className={"_Button" + (useBorder ? " bordered" : "")} 
            onClick={action}
            style={{ ...style, marginTop: marginTop || 24, marginBottom: marginBottom || 6 }}
        >
            <span className="button-label">{text}</span>
        </div>
    )
}