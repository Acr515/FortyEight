/**
 * Used to display values that should always have a decimal
 * @param {number} num Any number
 * @returns A string with .0 at the end of whole numbers
 */
export default function addLeadingZero(num) {
    return Math.round(num) == num ? num.toString() + ".0" : num.toString();
}