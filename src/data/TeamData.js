import date from 'date-and-time';
import { VERSION_NAME, VERSION_NUMBER } from '../config';
import generateHexString from 'util/generateHexString';
import getTeamName from 'data/getTeamName';
import gameData from 'util/gameData';

/**
 * A mutable array that holds every team object
 */
var TeamData = [];
export default TeamData;

/**
 * Creates an object for a team to be inserted into TeamData
 * @param {Number} num the team number
 * @returns object with a bunch of empty team properties in it
 */
export const createTeamObject = (num) => {
    return {
        number: Number(num),
        name: getTeamName(num),
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
    let now = new Date();

    return {
        vnum: VERSION_NUMBER,
        vstr: VERSION_NAME,
        game: gameData.year,
        timestamp: date.format(now, "M/D/YY, h:mm A"),
        id: generateHexString(8),
        name: "",
        teamNumber: -1,
        eventCode: "",
        matchNumber: -1,
        performance: {}
    }
}