import React from "react";
import ImageButton from "../ImageButton";
import Chevron from "../../assets/images/chevron.png";
import './style.scss';
import { useNavigate } from "react-router-dom";

export default function PageHeader({text, showBack, backText, location}) {
    return (
        <div className="_PageHeader">
            {
                showBack && <BackButton text={backText} location={location} />
            }
            <h1>{text}</h1>
        </div>
    )
}

export function BackButton({text, location}) {

    const navigate = useNavigate();

    return (
        <a 
            className="_BackButton"
            onClick={() => { navigate(location); }}
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