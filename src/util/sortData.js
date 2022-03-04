// A number of functions intended to be used for sorting data

export const Method = {
    MatchAscending: "Match Ascending",
    MatchDescending: "Match Descending",
    TeamNoAscending: "Team # Ascending",
    TeamNoDescending: "Team # Descending"
}

/**
 * Sorts an array of a team's data.
 * @param {Match[]} data The team's data
 * @param {Method} method The sort method (MatchAscending or MatchDescending)
 * @returns The newly sorted array. The array fed into the function is NOT modified.
 */
export function sortTeamData(data, method) {
    let newData = [];
    data.forEach(form => { newData.push(form); });
    newData.sort((a, b) => {
        if (method == Method.MatchAscending) {
            if (a.eventCode < b.eventCode) return -1; else if (a.eventCode > b.eventCode) return 1;
            return a.matchNumber < b.matchNumber ? -1 : 1;
        } else if (method == Method.MatchDescending) {
            if (a.eventCode < b.eventCode) return 1; else if (a.eventCode > b.eventCode) return -1;
            return a.matchNumber < b.matchNumber ? 1 : -1;
        } else {
            console.log("The sort method could not be determined and a team data array was not sorted properly.");
            return 1;
        }
    });
    return newData;
}

/**
 * Sorts an array of teams. In most cases, this array will be TeamData, but you can use any you wish.
 * @param {Team[]} data The teams to be sorted
 * @param {Method} method The sort method (TeamNoAscending or TeamNoDescending are currently supported)
 * @returns The newly sorted array. The array fed into the function is NOT modified.
 */
export function sortTeams(data, method) {
    let newTeams = [];
    data.forEach(team => { newTeams.push(team) });
    newTeams.sort((a, b) => {
        if (method == Method.TeamNoAscending) {
            return a.number - b.number;
        } else if (method == Method.TeamNoDescending) {
            return b.number - a.number;
        }
    });
    return newTeams;
}

/**
 * Implemented from https://stackoverflow.com/a/2450976/9727894, randomly shuffles an array
 * @param {[]} array The array to shuffle
 * @returns A copy of a shuffled array
 */
export function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }