// A number of functions intended to be used for sorting data

import calculateRPI from "../data/game_specific/calculateRPI/2022";
import Events from "../data/game_specific/eventCodes/2022";
import { findEvent } from "../data/game_specific/eventCodes/_Universal";
import ScoreCalculator from "../data/game_specific/ScoreCalculator/2022";
import { getTeamData } from "../data/SearchData";

export const Method = {
    MatchAscending: "Match Ascending",
    MatchDescending: "Match Descending",
    TeamNoAscending: "Team # Ascending",
    TeamNoDescending: "Team # Descending",
    StrengthDescending: "Strength Descending",
    AverageEndgameDescending: "Average Endgame Descending",
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
            let aEvent = findEvent(Events, a.eventCode);
            let bEvent = findEvent(Events, b.eventCode);
            if (aEvent == null) return 1;
            if (bEvent == null) return -1;
            if (aEvent.code == bEvent.code) return a.matchNumber < b.matchNumber ? -1 : 1;
            if (aEvent.week == bEvent.week) return a.eventCode < b.eventCode ? -1 : 1;
            return (aEvent.week + 1) - (bEvent.week + 1);
        } else if (method == Method.MatchDescending) {
            let aEvent = findEvent(Events, a.eventCode);
            let bEvent = findEvent(Events, b.eventCode);
            if (aEvent == null) return 1;
            if (bEvent == null) return -1;
            if (aEvent.code == bEvent.code) return a.matchNumber > b.matchNumber ? -1 : 1;
            if (aEvent.week == bEvent.week) return a.eventCode > b.eventCode ? -1 : 1;
            return (bEvent.week + 1) - (aEvent.week + 1);
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
        } else if (method == Method.StrengthDescending) {
            return calculateRPI(b).RPI - calculateRPI(a).RPI;
        } else if (method == Method.AverageEndgameDescending) {
            let aEndgame = 0, bEndgame = 0;
            let aData = getTeamData(a.number, data).data, bData = getTeamData(b.number, data).data
            aData.forEach(match => aEndgame += ScoreCalculator.Endgame.getScore(match));
            bData.forEach(match => bEndgame += ScoreCalculator.Endgame.getScore(match));
            return (bEndgame / bData.length) - (aEndgame / aData.length);
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