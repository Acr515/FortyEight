import { DEVELOP_MODE } from "/src/config";
import hitTBA from "util/hitTBA";
import weighTeam, { WeightSets } from "./game_specific/weighTeam/GAME_YEAR";
import { getTeamData } from "./SearchData";

/**
 * Converts an immutable state object to a mutable dictionary with the exact same values- in this case, used to
 * convert the state object into a form that can be altered and passed back into the state setter.
 * @param {PlayoffHelperData} ph The state object containing the playoff helper data
 * @returns A new PlayoffHelperData object with the exact same values as the old one
 */
export function clonePlayoffHelper(ph) {
    return { ...ph };
}

/**
 * A dictionary of possible states.
 */
export const PlayoffHelperState = {
    INACTIVE: "inactive",                       // no data in memory
    READY: "ready",                             // ranking data is available
    SIMULATED_DRAFT: "simulated draft",         // a playoff draft has been simulated
    SIMULATED_PLAYOFFS: "simulated playoffs",   // playoffs have been simulated
    LIVE_DRAFT: "live draft",                   // in-progress live draft
    LIVE_PLAYOFFS: "live playoffs"              // draft has finished, ready to provide insights on alliances
};

/**
 * Template interface for storing playoff helper data (state, teams, alliance picks)
 */
export const PlayoffHelperData = {
    teams: [],
    alliances: [],
    state: PlayoffHelperState.INACTIVE,
    draftState: {
        round: 1,
        alliance: 1
    },
    config: {
        fullTBAData: false,
        backupSelections: false
    }
};

/**
 * A dictionary of functions designed to quickly modify `PlayoffHelperData` based objects.
 */
const PlayoffHelperFunctions = {
    /**
     * Deletes alliance data while leaving team and ranking information intact.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     */
    flush: (ph, phSetter) => {
        let playoffHelper = clonePlayoffHelper(ph);

        playoffHelper.alliances = [];
        playoffHelper.state = PlayoffHelperState.READY;
        playoffHelper.draftState = {
            round: 1,
            alliance: 1
        };

        phSetter(playoffHelper);
    },

    /**
     * Deletes all information and resets the playoff helper.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     */
    reset: (ph, phSetter) => {
        phSetter(clonePlayoffHelper(PlayoffHelperData));
    },

    /**
     * Readies the playoff helper for alliance selection, real-time or simulated.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {PlayoffHelperState} mode Either `SIMULATED_DRAFT` or `LIVE_DRAFT` based on user input
     * @param {boolean} backupSelections If true, alliances will have four teams
     */
    setup: (ph, phSetter, mode, backupSelections) => {
        let playoffHelper = clonePlayoffHelper(ph);
        
        // Run calculations on playoff teams
        let emptyTeams = [];
        playoffHelper.teams.forEach(team => {
            let returnValue = team.calculatePowerScores();
            if (returnValue !== null) emptyTeams.push(returnValue);
        });
        if (emptyTeams.length > 0) {
            // Throw error
            phSetter(playoffHelper);
            console.error("Analysis was halted- the following teams don't have data in memory: " + emptyTeams);
            return;
        }

        // Setup the draft and initial alliances
        playoffHelper.teams.sort((a, b) => a.qualRanking - b.qualRanking);
        for (let i = 0; i < 8; i ++) {
            playoffHelper.alliances.push([playoffHelper.teams[i].teamNumber]);
        }

        // Setup config and state
        playoffHelper.state = mode;
        playoffHelper.config.backupSelections = backupSelections;

        phSetter(playoffHelper);
    },

    /**
     * Retrieves ranking information from The Blue Alliance and saves it to memory.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {string} eventKey The event key to pull from TBA
     * @param {function} failureCallback The function to run in case the API can't be reached
     */
    getTBARankings(ph, phSetter, eventKey, failureCallback) {
        let playoffHelper = clonePlayoffHelper(ph);

        hitTBA(`event/${eventKey}/rankings`, data => {
            data.rankings.forEach(team => {
                // Add to teams array
                playoffHelper.teams.push(new PlayoffTeam(
                    Number(team.team_key.replace("frc", "")),
                    team.rank,
                    [ team.record.wins, team.record.losses, team.record.ties ],
                    // Math.round(team.extra_stats[0] / team.matches_played * 100) / 100 // Formerly RP score
                ));
            })
            playoffHelper.config.fullTBAData = true;
            playoffHelper.state = PlayoffHelperState.READY;

            phSetter(playoffHelper);
        }, failureCallback);
    },

    /**
     * The alternative to getTBARankings, gets team numbers in order of ranking.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {Array} teams An array of team numbers in order of ranking
     */
    setManualRankings(ph, phSetter, teams) {
        let playoffHelper = clonePlayoffHelper(ph);

        teams.forEach((team, ind) => {
            playoffHelper.teams.push(new PlayoffTeam(
                team,
                ind + 1
            ));
        });
        playoffHelper.state = PlayoffHelperState.READY;

        phSetter(playoffHelper);
    },

    /**
     * Gets playoff information from a given team number.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {number} teamNumber The team number of the `PlayoffTeam` to retrieve
     * @returns A `PlayoffTeam` object, null if the team can't be found
     */
    getTeam(ph, teamNumber) {
        let returnTeam = null;
        ph.teams.forEach(team => {
            if (team.teamNumber == teamNumber) {
                returnTeam = team;
                return;
            }
        });
        return returnTeam;
    },

    /**
     * Picks a team and advances the playoff selection process.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {number} teamNumber The team number to pick
     */
    pickTeam(ph, phSetter, teamNumber) {
        let playoffHelper = clonePlayoffHelper(ph);

        // implementation

        phSetter(playoffHelper);
    },

    /**
     * Sets a team's status to declined, exempting them from being picked.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {number} teamNumber The team number that is declining
     */
    decline(ph, phSetter, teamNumber) {
        let playoffHelper = clonePlayoffHelper(ph);

        // implementation

        phSetter(playoffHelper);
    },
};

export default PlayoffHelperFunctions;

/**
 * Encaspulated data about every team being considered for a playoff spot.
 */
export class PlayoffTeam {
    teamNumber;
    qualRanking;
    wins;
    losses;
    ties = 0;
    captain = false;
    selected = false;
    declined = false;
    powerScores = {};
    bestCompositeScore = -1;
    bestCompositeType = null;

    /**
     * Creates a PlayoffTeam for use in PlayoffHelperData. The constructor also runs calculations for aggregate stats immediately upon creation.
     * @param {Number} teamNumber The team number of the robot
     * @param {Number} qualRanking The team's qualification round ranking
     * @param {Array} wlt Optional. Wins, losses, ties in qualification round
     */
    constructor(teamNumber, qualRanking, wlt = [-1, -1, -1]) {
        this.teamNumber = teamNumber;
        this.qualRanking = qualRanking;
        this.wins = wlt[0];
        this.losses = wlt[1];
        this.ties = wlt[2];
    }

    /**
     * Gets the team's full record in qualification matches. If information is not available, returns an empty string.
     * @returns Readable string of the team's qualifying record
     */
    getRecord() { return this.wins == -1 ? "" : `${ this.wins }-${ this.losses }${ this.ties > 0 ? `-${ this.ties }` : "" }` }

    /**
     * Calculates and stores weighted scores. Should be run before any analysis begins.
     */
    calculatePowerScores() {

        // Check if team exists or not
        if (getTeamData(this.teamNumber) === null) {
            // Team doesn't exist; pitch a fit if we aren't in development mode
            if (DEVELOP_MODE) {
                // Fill with fake data
                this.powerScores.WellRounded = WeightSets.WellRounded;
                this.powerScores.WellRounded.Defense = { instances: 0, compositeStrength: 0 };
                this.powerScores.WellRounded.Composite = 10;
                
                this.powerScores.Defensive = WeightSets.Defensive;
                this.powerScores.Defensive.Defense = { instances: 0, compositeStrength: 0 };
                this.powerScores.Defensive.Composite = 10;

                this.bestCompositeScore = 10;
                this.bestCompositeType = "WellRounded";
            } else {
                return this.teamNumber; // incident will be logged and reported
            }
        }

        Object.keys(WeightSets).forEach(setName => {
            let scores = weighTeam(getTeamData(this.teamNumber), WeightSets[setName]);
            this.powerScores[setName] = scores;
            if (scores.Composite > this.bestCompositeScore) {
                this.bestCompositeScore = scores.Composite;
                this.bestCompositeType = setName;
            }
        });
        return null;
    }
}