import React from "react";
import ImageButton from "../ImageButton";
import Chevron from "../../assets/images/chevron.png";
import './style.scss';
import { useNavigate } from "react-router-dom";

export default function PageHeader({text, showBack, backText}) {
    return (
        <div className="_PageHeader">
            {
                showBack && <BackButton text={backText} />
            }
            <h1>{text}</h1>
        </div>
    )
}

export function BackButton({text}) {

    const navigate = useNavigate();

    return (
        <a 
            className="_BackButton"
            onClick={() => { navigate(-1); }}
        >
            <ImageButton
                color="black"
                imageData={Chevron}
                style={{
                    width: 16,
                    height: 16,
                    transform: "rotate(-90deg) translateX(6px)",
                    filter: "invert(22%) sepia(56%) saturate(2475%) hue-rotate(231deg) brightness(99%) contrast(93%)"
                }}
                disabled={true}
            />
            {typeof text !== 'undefined' ? text: "Back"}
        </a>
    )
}