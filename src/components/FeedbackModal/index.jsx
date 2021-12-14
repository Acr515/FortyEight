import React, { useState } from 'react';
import './style.scss';
import XImage from '../../assets/images/x.png';

export default function FeedbackModal({text, isError, revealed, revealFunction}) {
    return (
        <div 
            className={"_FeedbackModal" + (isError ? " error" : "")}
            style={{ top: revealed ? 16 : -120 }}
        >
            <span className="modal-text">{text}</span>
            <button
                className="x-button"
                style={{ backgroundImage: 'url(' + XImage + ')' }}
                onClick={() => revealFunction(false)}
            />
        </div>
    )
}