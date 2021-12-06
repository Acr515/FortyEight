import React from "react";
import './style.scss';

export default function PageHeader({text}) {
    return (
        <div className="_PageHeader">
            <h1>{text}</h1>
        </div>
    )
}