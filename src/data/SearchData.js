import TeamData from "./TeamData";

// Series of functions that comb TeamData and return results or booleans

/**
 * Sees if any data has been submitted for a team.
 * @param {number} num The team number to check
 * @returns {boolean} True if team exists, false if not
 */
export function teamExists(num) {
    return getTeamData(num) != null;
}

/**
 * It is important to note that this function returns the ENTIRE TEAM OBJECT. If you need to access the 
 * actual match data for this team, use `getTeamData(num).data`.
 * @param {number} num The team number to search
 * @returns The team object with the corresponding number
 */
export function getTeamData(num) {
    let returnTeam = null;
    TeamData.forEach(team => { if (team.number == num) { returnTeam = team; return; } });
    return returnTeam;
}