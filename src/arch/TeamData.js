/**
 * A mutable array that holds every team object
 */
export default TeamData = [];

/**
 * Acts as an enumerator for different endgame possibilities
 */
export const EndgameResult = { CLIMB: "CLIMB", PARK: "PARK", NONE: "NONE" };

/**
 * Creates an object for a team to be inserted into TeamData
 * @param {Number} num the team number
 * @returns object with a bunch of empty team properties in it
 */
export const createTeamObject = (num) => {
    return {
        number: num,
        name: "Placeholder Team Name",
        ranking: -1,
        wins: -1,
        losses: -1,
        data: []
    }
}

/**
 * Creates an empty form object for match-to-match scouting
 * @returns object with a bunch of empty form properties in it
 */
export const createFormObject = () => {
    return {
        name: "",
        teamNumber: "",
        eventCode: "",
        matchNumber: 0,
        performance: {
            pieces: 0,
            endgame: EndgameResult.NONE
        }
    }
}