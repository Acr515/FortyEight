import React from 'react';
import './style.scss';

/**
 * Used mainly for testing different aesthetic and typographic presentations. Isolated from global style rules.
 */
export default function Test() {
    return (
        <div className="container">
            <div>
                <h1>Header 1</h1>
                <h2>Header 2</h2>
                <h3>Header 3</h3>
                <h4>Header 4</h4>
                <h5>Header 5</h5>
                <h6>Header 6</h6>
                <p>This is general paragraph text. It can be <strong>bolded for exaggeration</strong>, it can be <em>italisized for emphasis</em>, or even <strong><em>both</em></strong>.</p>
            </div>
            <div>
                <p>The following are possible presentations for numbers:</p>
                <div className="number">54.3</div>
            </div>
        </div>
    );
}