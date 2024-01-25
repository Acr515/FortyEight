import { Weights } from "./GAME_YEAR";

// This file serves as a middle party to the game year scripting and the `TeamAnalyzer`.

/**
 * Produces a set of sliders used to weigh teams. This component doesn't run those calculations,
 * it just produces the inputs for them.
 * @param {Array} weighState An object of weights that correlate to those in the year file
 * @param {function} weightStateSetter The state function for `weighState` 
 */
export function WeightSliderSet({ weighState, weighStateSetter }) {
    const WeightSlider = ({ title }) => {

    };

    return Object.keys(Weights).map(weight => {

    });
}

/**
 * 
 */
export function sortTeamsByWeight({ data }) {

}