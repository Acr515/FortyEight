import { Method, sortTeams } from "../util/sortData";
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
 * @param {Team[]} dataset Optionally, use a custom dataset. Defaults to TeamData
 * @returns The team object with the corresponding number
 */
export function getTeamData(num, dataset = TeamData) {
    let returnTeam = null;
    dataset.forEach(team => { if (team.number == num) { returnTeam = team; return; } });
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

/**
 * Gets the location of a given team number in the TeamData array
 * @param {number} num The team number to search 
 * @returns The index of the team's location in TeamData array, -1 if not found
 */
export function getTeamIndex(num) {
    let ind = -1;
    TeamData.forEach((team, i) => { if (team.number == num) ind = i; });
    return ind;
}

/**
 * Returns an array of all team numbers in memory. Sorted by number increasing
 * @param {Team[]} teams The teams to sort through
 * @returns An array of team numbers
 */
export function getTeamNumberArray(teams) {
    let sortedTeams = sortTeams(teams, Method.TeamNoAscending);
    let numbers = [];
    sortedTeams.forEach(team => { numbers.push(team.number) });
    return numbers;
}