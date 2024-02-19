/**
 * Generates a random hexadecimal string. Courtesy of https://stackoverflow.com/a/58326357/9727894
 * @param {number} size Number of characters
 * @returns hex string
 */

const generateHexString = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
export default generateHexString;