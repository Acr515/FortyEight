import React from "react";
import "./style.scss";

export default function LoadingSpinner({ className = "", style = {} }) {
    return <div className={`_LoadingSpinner ${className}`} style={{...style}}>
    </div>
}