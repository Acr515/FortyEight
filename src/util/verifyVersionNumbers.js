/**
 * Takes the version numbers of two different sets of data and confirms if they are compatible with each other.
 * This should be used mostly for checking if a certain piece of data can be imported into the database
 * @param {number} older The older version number
 * @param {number} newer The newer version number
 * @returns true if the older version is valid, false otherwise
 */
export default function verifyVersionNumbers(older, newer) {
    if (Math.floor(older) < Math.floor(newer)) return false;
    return true;
}