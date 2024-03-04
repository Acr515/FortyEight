/**
 * Gets the ordinal suffix of a number (1st, 2nd, 3rd, etc.)
 * @param {*} i The number to use
 * @returns A string with the number provided and the proper suffix
 * @link https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
 */
export function getOrdinalSuffix(i) {
    let j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}