import React from "react";
import Chevron from '../../assets/images/chevron.png';
import './style.scss';

/**
 * Creates a small set of arrows that pair with an input element. Can use custom functions for the arrows.
 * @param {function} increment The function to run when the up arrow is clicked 
 * @param {function} decrement The function to run when the down arrow is clicked 
 * @param {boolean} disabled Optional. When false, the arrows don't do anything
 * @returns 
 */
export default function Spinner({ increment = () => {}, decrement = () => {}, disabled = false }) {
    return (
        <div className="_Spinner">
            <button 
                type="button" 
                className="arrow"
                style={{ backgroundImage: 'url(' + Chevron + ')' }}
                onClick={increment}
                disabled={disabled}
            />
            <button 
                type="button" 
                className="arrow down" 
                style={{ backgroundImage: 'url(' + Chevron + ')' }}
                onClick={decrement}
                disabled={disabled}
            />
        </div>
    )
}