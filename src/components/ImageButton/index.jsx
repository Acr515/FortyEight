import React from "react";
import imageImports from "../../util/imageImports";
import './style.scss';

export default function ImageButton({imageName, imageData, onClick, style, color}) {
    let className = "_ImageButton" + (color != undefined ? " " + color : "");
    let imageURL = imageData != undefined ? imageData : imageImports.icons[imageName];
    return (
        <button 
            className={className}
            onClick={onClick}
            style={{ backgroundImage: 'url(' + imageURL + ')', ...style }} 
        ></button>
    )
}