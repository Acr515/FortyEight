import TeamData from "./TeamData";

/**
 * Saves TeamData to localStorage. Accepts no parameters.
 */
export function saveData() {
    localStorage.setItem("TeamData", JSON.stringify(TeamData));
}

/**
 * Writes content from localStorage to TeamData variable. Does nothing if localStorage is empty.
 */
export function loadData() {
    if (localStorage.getItem("TeamData") != null) {
        let loadedData = JSON.parse(localStorage.getItem("TeamData"));
        if (TeamData.length > 0) TeamData.splice(0, TeamData.length);

        loadedData.forEach(team => { TeamData.push(team); });
    }
}