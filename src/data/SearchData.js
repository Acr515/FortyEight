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

/**
 * Combs the TeamData object for a specific match with a given ID. Good for when the specific match is 
 * known, but the reference to it does not directly infer its location in memory.
 * @param {string} id The string ID correlating to the match information 
 * @returns False if no match is found, otherwise an object with three properties: `match` containing 
 * a copy of the match data, `dataset` containing a copy of the match array that holds it, and `index` 
 * containing the array index of the information
 */
export function findMatchDataByID(id) {
    let returnData = false;
    TeamData.forEach(team => {
        team.data.forEach((match, index) => {
            if (match.id == id) returnData = { match, index, dataset: team.data };
        })
    });
    if (!returnData) console.log("findMatchDataByID() could not find a form");
    return returnData;
}