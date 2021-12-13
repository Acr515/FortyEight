import React, { useState } from 'react';
import './style.scss';
import Chevron from '../../assets/images/chevron.png';

/**
 * Creates an input box.
 * @param label The label to display next to the text box
 * @param prefill What text/value to prefill the text box with  
 * @param id The ID assigned to the input element, as well as the `for` attribute of the label
 * @param isCheckbox Whether to make the input a checkbox or not
 * @param isNumerical Whether to add arrows that count up/down or not
 * @param marginBottom Defaults to 18. Pixel margin to add to bottom of container element
 * @param alignLabel Where to align the label of the textbox. Accepts a string "top", "middle", or "bottom"
 */
export default function Input({label, prefill, id, onInput, isCheckbox, isNumerical, marginBottom, alignLabel = "middle"}) {
    
    const [value, setValue] = useState(
        typeof prefill !== "undefined" ? prefill :
        isNumerical ? 0 :
        isCheckbox ? false : ""
    );

    const updateValue = e => {
        if (typeof onInput !== "undefined") onInput(e);

        let val = e.target.value;
        if (isNumerical && (/^\d+$/.test(val) || val === "")) {
            setValue(val);
        } else if (!isNumerical) setValue(val);
    }

    const increment = () => {
        setValue(Number(value) + 1);
    }

    const decrement = () => {
        setValue(Number(value) - 1);
    }
    
    return (
        <div className="_Input" style={{ marginBottom: marginBottom || 18 }}>
            <label 
                htmlFor={id}
                style={{ marginTop: alignLabel == "top" || alignLabel == "middle" ? "auto" : 0 , marginBottom: alignLabel == "bottom" || alignLabel == "middle" ? "auto" : 0 }}
            >
                {label}
            </label>
            <div className="input-area">
                <input 
                    className="text-box"
                    id={id} 
                    type={isCheckbox ? "checkbox" : "text"}
                    value={value}
                    onInput={updateValue}
                />
                {isNumerical && (
                    <div className="control-area">
                        <button 
                            type="button" 
                            className="arrow"
                            style={{ backgroundImage: 'url(' + Chevron + ')' }}
                            onClick={increment}
                        />
                        <button 
                            type="button" 
                            className="arrow down" 
                            style={{ backgroundImage: 'url(' + Chevron + ')' }}
                            onClick={decrement}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}