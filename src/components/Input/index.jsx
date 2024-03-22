import React, { useEffect, useState } from 'react';
import Chevron from '../../assets/images/chevron.png';
import './style.scss';
import Spinner from 'components/Spinner';

/**
 * Creates an input box.
 * @param label The label to display next to the text box. If a label is not given, then the label element is not rendered.
 * @param prefill What text/value to prefill the text box with  
 * @param id The ID assigned to the input element, as well as the `for` attribute of the label
 * @param onInput A function that runs alongside the input's normal input event. The `e` variable is automatically used as a parameter, so keep this in mind
 * @param isCheckbox Whether to make the input a checkbox or not
 * @param isNumerical Whether to add arrows that count up/down or not
 * @param {array} bounds If isNumerical is true, the first entry should be the lower boundary and the second entry should be the upper boundary
 * @param optionList Omit if not using an option list. Should be an array of objects containing "label" and "value" keys
 * @param marginBottom Defaults to 18. Pixel margin to add to bottom of container element
 * @param alignLabel Where to vertically align the label of the textbox. Accepts a string "top", "middle", or "bottom"
 * @param textArea Whether to render the input as a text area or not
 * @param required Attaches a "required" class to the `input` element embedded inside the component, as well as flipping on the `required` HTML attribute for the `input`
 * @param disabled If true, disables the input for changes by adding the disabled HTML attribute to the element
 * @param warning If true, flags the element by outlining the input element in red to resemble an input error
 * @param style Any custom CSS styles to apply to the parent element of the input/label pair
 * @param labelStyle Any custom CSS styles to apply to the label
 * @param externalUpdate If you wish to have control over this input's values using state from its parent, its state should be set using this property. A `useEffect()` hook will run when it changes
 * @param getExternalUpdate This function should return a value that will be used to set the value state of this input component
 * @param floodLabel Optional. When true, floods the available space with the label instead of the normal 50/50 width split
 */
export default function Input({ label, prefill, id, onInput, isCheckbox, isNumerical = false, bounds = null, optionList, marginBottom, alignLabel = "middle", textArea = false, required = false, disabled = false, warning = false, style = {}, labelStyle = {}, externalUpdate = null, getExternalUpdate = null, floodLabel = false }) {
    
    optionList = typeof optionList !== "undefined" ? optionList : false;

    const [value, setValue] = useState(
        typeof prefill !== "undefined" ? prefill :
        isNumerical ? 0 :
        isCheckbox ? false : ""
    );

    const inputUpdated = e => {
        if (typeof onInput !== "undefined") onInput(e);

        let val = e.target.value;
        if (isNumerical && (/^\d+$/.test(val) || val === "")) {
            setValue(val);
        } else if (!isNumerical) setValue(val);
    }

    const increment = () => {
        if (bounds == null) setValue(Number(value) + 1);
        else if (Number(value) < bounds[1]) setValue(Number(value) + 1);
    }

    const decrement = () => {
        if (bounds == null) setValue(Number(value) - 1);
        else if (Number(value) > bounds[0]) setValue(Number(value) - 1);
    }

    if (externalUpdate != null) useEffect(() => {
        setValue(getExternalUpdate());
    }, [externalUpdate])
    
    return (
        <div className={`_Input ${floodLabel ? "flood-label" : ""}`} style={{ ...style, marginBottom: marginBottom || 18 }}>
            { typeof label !== 'undefined' && (
                <label 
                    htmlFor={id}
                    style={{ marginTop: alignLabel == "top" || alignLabel == "middle" ? "auto" : 0 , marginBottom: alignLabel == "bottom" || alignLabel == "middle" ? "auto" : 0, ...labelStyle }}
                >
                    {label}
                </label>
            )}
            <div className="input-area">
                { !optionList ? (
                    <input 
                        className={"input text-box" + (
                            (required ? " required" : "") +
                            (isNumerical ? " numerical" : "") +
                            (warning ? " warning" : "")
                            )
                        }
                        id={id} 
                        name={id}
                        type={isCheckbox ? "checkbox" : "text"}
                        value={value}
                        defaultChecked={isCheckbox && typeof prefill !== 'undefined' && prefill}
                        onInput={inputUpdated}
                        required={required}
                        disabled={disabled}
                    />
                ) : (
                    <select
                        className={"input text-box dropdown-box" + (required ? " required" : "")}
                        id={id}
                        name={id}
                        onInput={inputUpdated}
                        value={value}
                        required={required}
                        disabled={disabled}
                    >
                        <option value="" disabled>Select...</option>
                        {
                            optionList.map(opt => <option value={opt.value} key={opt.value}>{opt.label}</option>)
                        }
                    </select>
                )}
                { isNumerical && <Spinner
                    increment={increment}
                    decrement={decrement}
                    disabled={disabled}
                />} 
            </div>
        </div>
    )
}