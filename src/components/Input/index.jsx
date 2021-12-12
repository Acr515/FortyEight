import React from 'react';
import './style.scss';

export default function Input({label, prefill, id, isCheckbox, isNumerical, marginBottom}) {
    return (
        <div className="_Input" style={{ marginBottom: marginBottom || 18 }}>
            <label for={id}>{label}</label>
            <div className="input-area">
                <input className="text-box" id={id} />
            </div>
        </div>
    )
}