import hitTBA from "util/hitTBA";

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
     * Readies the playoff helper for selection, real-time or simulated.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {PlayoffHelperState} mode Either `SIMULATED_DRAFT` or `LIVE_DRAFT` based on user input
     * @param {boolean} backupSelections If true, alliances will have four teams
     */
    setup: (ph, phSetter, mode, backupSelections) => {
        let playoffHelper = clonePlayoffHelper(ph);

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
                    Math.round(team.extra_stats[0] / team.matches_played * 100) / 100
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
        teams.forEach((team, ind) => {
            this.teams.push(new PlayoffTeam(
                team,
                ind + 1
            ));
        });
        this.state = PlayoffHelperState.READY;
    }
};

export default PlayoffHelperFunctions;

/**
 * Encaspulated data about every team being considered for a playoff spot.
 */
export class PlayoffTeam {
    teamNumber;
    qualRanking;
    rankingScore;
    wins;
    losses;
    ties = 0;
    captain = false;
    selected = false;
    declined = false;

    /**
     * Creates a PlayoffTeam for use in PlayoffHelperData. The constructor also runs calculations for aggregate stats immediately upon creation.
     * @param {Number} teamNumber The team number of the robot
     * @param {Number} qualRanking The team's qualification round ranking
     * @param {Array} wlt Optional. Wins, losses, ties in qualification round
     * @param {Number} rankingScore Optional. Average RPs per match
     */
    constructor(teamNumber, qualRanking, wlt = [-1, -1, -1], rankingScore = -1) {
        this.teamNumber = teamNumber;
        this.qualRanking = qualRanking;
        this.wins = wlt[0];
        this.losses = wlt[1];
        this.ties = wlt[2];
        this.rankingScore = rankingScore;
    }

    /**
     * Gets the team's full record in qualification matches. If information is not available, returns an empty string.
     * @returns Readable string of the team's qualifying record
     */
    getRecord() { return this.wins == -1 ? "" : `${ this.wins }-${ this.losses }${ this.ties > 0 ? `-${ this.ties }` : "" }` }
}