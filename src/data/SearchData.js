import TeamData from "./TeamData";

// Series of functions that comb TeamData and return results or booleans

/**
 * Sees if any data has been submitted for a team.
 * @param {number} num The team number to check
 * @returns {boolean} True if team exists, false if not
 */
export function teamExists(num) {
    TeamData.forEach(team => { if (team.teamNumber == num) return true; });
    return false;
}