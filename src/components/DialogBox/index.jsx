import React, { useState } from 'react';
import Button from '../Button';
import './style.scss';

/**
 * Shows a dialog box with a black background behind it
 * @param {object} options An object with options.
 * 
 * The `options` parameter should use the following parameters:
 *  - body (string)
 *  - useConfirmation (boolean - optional, default FALSE)
 *  - confirmLabel (string - optional)
 *  - confirmFunction (function)
 *  - cancelLabel (string - optional)
 *  - cancelFunction (function - optional)
 */
export default function DialogBox({options, revealed, revealFunction}) {
    // Assign default values to options keys
    options.body = options.body || "This text should never be visible in production.";
    options.useConfirmation = typeof options.useConfirmation != "undefined" ? options.useConfirmation : false;
    options.confirmLabel = options.confirmLabel || "OK";
    options.confirmFunction = options.confirmFunction || (() => {});
    options.cancelLabel = options.cancelLabel || (!options.useConfirmation ? "OK" : "Cancel");
    options.cancelFunction = options.cancelFunction || revealFunction;

    return (
        <div 
            className={"_DialogBox" + (!revealed ? " hidden" : "")}
        >
            <div className="dialog-box">
                <div className="body-text">
                    {options.body}
                </div>
                <div className="button-area">
                    {options.useConfirmation && (
                        <Button
                            text={options.confirmLabel}
                            action={() => {options.confirmFunction(); revealFunction(); }}
                            marginTop={1}
                            marginBottom={1}
                            style={{ minWidth: 150, display: "inline-block", marginRight: 16 }}
                        />
                    )}
                    <Button
                        text={options.cancelLabel}
                        action={options.cancelFunction}
                        marginTop={1}
                        marginBottom={1}
                        style={{ minWidth: 150, display: "inline-block"  }}
                    />
                </div>
            </div>
        </div>
    )
}