import React from "react";
import imageImports from "../../util/imageImports";
import './style.scss';

/**
 * Creates an image with a custom color, hover animations, and handlers for clicks.
 * @param {string} imageName Doesn't currently work, but is supposed to be an alternative to importing images every time 
 * @param {string} imageData The image import to show
 * @param {function} onClick The event to run on button click 
 * @param {CSSStyleDeclaration} style CSS styles to apply to the element
 * @param {string} color Tints the image. Currently accepts either black, white, or red 
 * @param {boolean} disabled Turns off any hover/active animations in the CSS by adding the disabled class
 */
export default function ImageButton({imageName, imageData, onClick, style, color, disabled, className = ""}) {
    let combinedClassName = "_ImageButton" + (color != undefined ? " " + color : "") + (disabled != undefined && disabled ? " disabled" : "") + " " + className;
    let imageURL = imageData != undefined ? imageData : imageImports.icons[imageName];
    return (
        <button 
            className={combinedClassName}
            onClick={onClick}
            style={{ backgroundImage: 'url(' + imageURL + ')', ...style }} 
        ></button>
    )
}