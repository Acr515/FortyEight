import React from "react";
import ImageButton from "../ImageButton";
import Chevron from "../../assets/images/chevron.png";
import { useNavigate } from "react-router-dom";
import './style.scss';

export default function PageHeader({text, showBack, backText, location, backState = {}, children}) {
    return (
        <div className="_PageHeader">
            {
                showBack && <BackButton text={backText} location={location} backState={backState} />
            }
            <h1>{text}</h1>
            <div className="right-aligned-elements">{children}</div>
        </div>
    )
}

export function BackButton({text, location, backState}) {

    const navigate = useNavigate();
    const backClicked = () => {
        let destination;
        if (location == "/-1" || location == "-1") destination = -1; else destination = location;
        navigate(destination, { state: backState });
    };

    return (
        <a 
            className="_BackButton"
            onClick={backClicked}
        >
            <ImageButton
                color="black"
                imageData={Chevron}
                className="back-button-image"
                style={{
                    width: 16,
                    height: 16,
                    filter: "invert(22%) sepia(56%) saturate(2475%) hue-rotate(231deg) brightness(99%) contrast(93%)"
                }}
                disabled={true}
            />
            {typeof text !== 'undefined' ? text: "Back"}
        </a>
    )
}