import React, { useState } from 'react';
import './style.scss';
import XImage from '../../assets/images/x.png';
import ImageButton from '../ImageButton';

export default function FeedbackModal({text, isError, revealed, revealFunction}) {
    return (
        <div 
            className={"_FeedbackModal" + (isError ? " error" : "")}
            style={{ top: revealed ? 16 : -120 }}
        >
            <span className="modal-text">{text}</span>
            <ImageButton
                imageData={XImage}
                onClick={() => revealFunction(false)}
                color="white"
                style={{
                    width: 18,
                    height: 18,
                    flexGrow: 0,
                    flexShrink: 0,
                    marginTop: "auto",
                    marginBottom: "auto",
                    marginLeft: 4,
                    marginRight: 8
                }}
            />
        </div>
    )
}