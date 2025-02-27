import date from 'date-and-time';
import TeamData from "data/TeamData";
import { getTeamData } from "data/SearchData";
import ScoreCalculator from "data/game_specific/ScoreCalculator/GAME_YEAR";
import SimulationInformation from './GAME_YEAR';
import gameData from 'util/gameData/GAME_YEAR';

/**
 * Simulates an FRC match with any 3 v 3 teams.
 */
export default class Simulator {
    redTeams = [];              // Team objects for red alliance
    blueTeams = [];             // Team objects for blue alliance
    results;                    // Array of resulting simulated matches
    confidence;                 // A number between 0 and 1 representing the simulator's confidence in the results based on number of matches submitted
    config;                     // An object with a number of configuration options

    /**
     * Sets up the simulator. Defaults to using TeamData; use the other constructor if you have other data to use
     * @param {number[]} redTeamNumbers Array of red team #s
     * @param {number[]} blueTeamNumbers Array of blue team #s
     * @param {object} config An object of options
     */
    constructor(redTeamNumbers, blueTeamNumbers, config) {
        // Define config defaults
        this.config = config;
        this.config.simulations ??= 1000;       // The number of matches to play
        this.config.applyDefense ??= true;      // Whether or not the simulator should take defensive tendencies into account
        this.config.dataset ??= TeamData;       // The dataset to isolate simulation reference data from
        this.config.defaultInfluence ??= 1.5;   // The default influence value to give to biasedRandom
        this.config.biasMethod ??= "median";    // The bias method to use on the random number generator
        this.config.rngSeed ??= "seedageddon";  // The seed to feed into the random number generator

        // Setup team data and results
        redTeamNumbers.forEach(num => this.redTeams.push(getTeamData(num, this.config.dataset)));
        blueTeamNumbers.forEach(num => this.blueTeams.push(getTeamData(num, this.config.dataset)));
        this.results = {
            simulations: this.config.simulations,
            applyDefense: this.config.applyDefense,
            data: [],
            tieRate: 0,
            red: {
                teamNumbers: redTeamNumbers,
                ...structuredClone(BaseAllianceSimulationResults),
                ...structuredClone(SimulationInformation.baseAllianceData),
                insights: structuredClone(SimulationInformation.allianceInsights)
            },
            blue: {
                teamNumbers: blueTeamNumbers,
                ...structuredClone(BaseAllianceSimulationResults),
                ...structuredClone(SimulationInformation.baseAllianceData),
                insights: structuredClone(SimulationInformation.allianceInsights)
            },
            averageMatch: {},
            timestamp: date.format(new Date(), "M/D/YY, h:mm A")
        };
    }

    /**
     * Runs the simulation.
     * @param {function} callback Runs when the simulation is finished
     * @param {function} status Runs periodically to report status
     */
    async run(callback, status = () => {}) {
        // Seed a random number generator
        var seededRandom = require('seedrandom');
        var rng = seededRandom(this.config.rngSeed);

        /**
         * Generates a random number biased towards a certain number within the range. Read the StackOverflow answer
         * linked below for more information.
         * @param {number} min The lowest number
         * @param {number} max The highest number
         * @param {number} bias The number to bias towards
         * @param {number} influence A value of 1 means the robot is pretty predictable. A value of 0.75 begins to edge near reasonable inconsistency
         * @returns A random number within the given range
         * @see https://stackoverflow.com/a/29325222/9727894
         */
        const biasedRandom = (min, max, bias, influence) => {
            var rnd = rng() * (max - min) + min,    // random in range
                mix = rng() * influence;            // random mixer
            return rnd * (1 - mix) + bias * mix;    // mix full range and bias
        };

        /**
         * Finds the minimum, maximum, average, and median for a scoring category of a team. Also finds the number of
         * occurrences of the lowest value. The full implementation can be found inside the year's `SimulationInformation` object.
         * @param {Team} team The team object
         * @param {string} key The part of the game (i.e. auto, teleop)
         * @param {string} subkey The scoring category (i.e. cargoLow)
         * @param {function} method A function to use as a source for data, such as via the ScoreCalculator, instead of key-subkey pairs. -1 when not provided
         * @returns A object with keys for min, max, avg, and lowFreq
         */
        const getRange = (team, key, subkey, method = null) => SimulationInformation.getRange(team, key, subkey, method);

        /**
         * Gets all the match information for a team's contribution. Accounts for breakdowns, penalties, etc. Also calculates
         * the ODDS that a team will play defense and with what STRENGTH, but does NOT actually use these at all.
         * The full implementation can be found inside the year's `SimulationInformation` object.
         * @param {object} func A dictionary of universal functions for generating numbers
         * @param {Team} team The team to calculate for
         * @param {boolean} useRandom Should always be TRUE unless getting a one-off match result that is based only on averages
         * @param {string} biasMethod Used to determine the range with which to bias the number generator. Should be either "avg" or "median"
         * and doesn't make use of rng
         * @returns A Performance-like object (see performanceObject for more info)
         */
        const getTeamContribution = (team, useRandom = true, biasMethod = "avg") => SimulationInformation.getTeamContribution({ getRange, biasedRandom, rng, config: this.config }, team, useRandom, biasMethod);


        // This is where each simulation is run
        let redWins = 0, blueWins = 0, ties = 0;
        for (let progress = 0; progress < this.config.simulations; progress ++) {
            let redPerformances = [
                getTeamContribution(this.redTeams[0], true, this.config.biasMethod),
                getTeamContribution(this.redTeams[1], true, this.config.biasMethod),
                getTeamContribution(this.redTeams[2], true, this.config.biasMethod),
            ];
            let bluePerformances = [
                getTeamContribution(this.blueTeams[0], true, this.config.biasMethod),
                getTeamContribution(this.blueTeams[1], true, this.config.biasMethod),
                getTeamContribution(this.blueTeams[2], true, this.config.biasMethod),
            ];
            let matchDetails = new MatchDetails(redPerformances, bluePerformances, this.redTeams, this.blueTeams, this.config.applyDefense, rng);
            if (matchDetails.winner == "Red") redWins ++;
            else if (matchDetails.winner == "Blue") blueWins ++;
            else ties ++;

            // Compile stats to running averages, run team-wide calculations, and calculate team-specific insight data related to this match
            const postSimulationCalculations = color => {
                // Game-agnostic running averages/ranges
                this.results[color].scoreRange.avg += matchDetails[color].score;
                this.results[color].scoreRange.min = Math.min(matchDetails[color].score, this.results[color].scoreRange.min);
                this.results[color].scoreRange.max = Math.max(matchDetails[color].score, this.results[color].scoreRange.max);
                if (matchDetails.winner.toLowerCase() == color) {
                    let margin = matchDetails[color].score - matchDetails[color == "red" ? "blue" : "red"].score;
                    this.results[color].marginRange.avg += margin;
                    this.results[color].marginRange.min = Math.min(margin, this.results[color].marginRange.min);
                    this.results[color].marginRange.max = Math.max(margin, this.results[color].marginRange.max);
                }
                SimulationInformation.postSimulationCalculations(color, this.results, matchDetails);
            };

            postSimulationCalculations("red");
            postSimulationCalculations("blue");
            
            // Calculate inter-team insights related to this match
            SimulationInformation.calcInterAllianceAverages(this.results, matchDetails);

            this.results.data.push(matchDetails);
            status(progress);
        }


        // Post-simulation calculations
        if (redWins > 0) {
            this.results.red.marginRange.avg /= redWins;
        } else {
            this.results.red.marginRange.min = 0;
            this.results.blue.marginRange.max = 0;
        }
        if (blueWins > 0) {
            this.results.blue.marginRange.avg /= blueWins;
        } else {
            this.results.red.marginRange.min = 0;
            this.results.blue.marginRange.max = 0;
        }
        this.results.red.winRate = redWins / this.config.simulations;
        this.results.blue.winRate = blueWins / this.config.simulations;
        this.results.tieRate = ties / this.config.simulations;
        this.results.red.scoreRange.avg /= this.config.simulations;
        this.results.blue.scoreRange.avg /= this.config.simulations;
        for (let i = 0; i <= 4; i ++) {
            this.results.red.RPFreq[i] = this.results.red.RPFreq[i] / this.config.simulations * 100;
            this.results.blue.RPFreq[i] = this.results.blue.RPFreq[i] / this.config.simulations * 100;
        }
        SimulationInformation.postSimulation(this.results, this.config);

        // Get instance of an average score for this match-up
        this.results.averageMatch = new MatchDetails(
            [
                getTeamContribution(this.redTeams[0], false),
                getTeamContribution(this.redTeams[1], false),
                getTeamContribution(this.redTeams[2], false),
            ], 
            [
                getTeamContribution(this.blueTeams[0], false),
                getTeamContribution(this.blueTeams[1], false),
                getTeamContribution(this.blueTeams[2], false),
            ], 
            this.redTeams,
            this.blueTeams,
            this.config.applyDefense,
            rng
        );

        console.log("SIMULATOR: Done.");
        callback(this.results);
    }
}

/**
 * Synthesizes insights and total scoring information.
 */
class MatchDetails {
    red = {};
    blue = {};
    winner;

    /**
     * Creates a MatchDetails object, running post-match analysis during creation.
     * @param {performanceObject[]} redPerformances Array of filled-out performance objects for the red alliance
     * @param {performanceObject[]} bluePerformances Array of filled-out performance objects for the blue alliance
     * @param {Team[]} redTeams Array of Team objects for the red alliance
     * @param {Team[]} blueTeams Array of Team objects for the blue alliance
     * @param {boolean} useDefense If true, simulates defense by picking robots from each alliance to target
     * @param {function} rng The function which produces seeded random numbers
     */
    constructor(redPerformances, bluePerformances, redTeams, blueTeams, useDefense, rng) {
        this.red = new AllianceDetails(redPerformances, "Red", useDefense);
        this.blue = new AllianceDetails(bluePerformances, "Blue", useDefense);

        // Apply defense
        if (useDefense) {
            // Pick out the defender from each alliance
            let redDefender = null, blueDefender = null;
            redPerformances.forEach(team => {  
                if (team.defense.played) redDefender = team;
            });
            bluePerformances.forEach(team => {  
                if (team.defense.played) blueDefender = team;
            });

            if (redDefender != null) {
                // Pick out a blue scorer to defend against
                let blueScorer = null, blueScore = -10;
                bluePerformances.forEach(team => {
                    let score = ScoreCalculator.Teleop.getScore({ performance: team });
                    if (score > blueScore) {
                        blueScore = score;
                        blueScorer = team;
                    }
                });
                SimulationInformation.applyDefense(redDefender, blueScorer, rng);
            }

            if (blueDefender != null) {
                // Pick out a blue scorer to defend against
                let redScorer = null, redScore = -10;
                bluePerformances.forEach(team => {
                    let score = ScoreCalculator.Teleop.getScore({ performance: team });
                    if (score > redScore) {
                        redScore = score;
                        redScorer = team;
                    }
                });
                SimulationInformation.applyDefense(blueDefender, redScorer, rng);
            }
        }

        // Calculate final scores and RP totals
        SimulationInformation.preCompilationCalculations(redTeams, this.red.teamPerformances, this.red.gameStats, rng);
        SimulationInformation.preCompilationCalculations(blueTeams, this.blue.teamPerformances, this.blue.gameStats, rng);
        this.red.getScores(this.blue);
        this.blue.getScores(this.red);
        this.red.getRPs();
        this.blue.getRPs();
        if (typeof SimulationInformation.runRPAdjustments !== 'undefined') SimulationInformation.runRPAdjustments(this.red, this.blue); // implement this function if alliance RPs have ANY cross-dependency
        
        this.winner = this.getWinner();
        if (this.winner == "Red") this.red.matchRP = gameData.config.baseRPAmounts.win;
        else if (this.winner == "Blue") this.blue.matchRP = gameData.config.baseRPAmounts.win;
        else {
            this.red.matchRP = gameData.config.baseRPAmounts.tie;
            this.blue.matchRP = gameData.config.baseRPAmounts.tie;
        }
    }

    getWinner() {
        if (this.red.score == this.blue.score) return "Tie";    // Tie
        return this.red.score > this.blue.score ? "Red" : "Blue"
    }

    // Breaks a tie and declares a winner. Mostly exists for novelty but maybe it'd be useful
    getTiebreakWinner() {
        return SimulationInformation.getTiebreakWinner(this.red, this.blue);
    }
}

/**
 * Stores information about each alliance's performance and settles disputes over who can climb to where and who will defend.
 * Only encapsulates data for a single alliance in a single match; the object that holds data for an alliance across the entire simulation is defined in the `Simulator` constructor.
 */
class AllianceDetails {
    color;
    teamPerformances;
    score = 0;
    autoScore = 0;
    teleopScore = 0;
    endgameScore = 0;
    matchRP = 0;
    gameStats = structuredClone(SimulationInformation.singleMatchAllianceDetails);

    constructor(performances, color, useDefense) {
        this.teamPerformances = performances;
        this.color = color;

        // Check if two or more robots are trying to play defense
        if (useDefense) {
            let defenseTeams = [];
            this.teamPerformances.forEach((team, index) => {
                if (team.defense.played) defenseTeams.push(index);
            });
            if (defenseTeams.length > 1) {
                let lowestOffense = 1000, lowestOffenseIndex = -1;
                defenseTeams.forEach(index => {
                    let team = this.teamPerformances[index];
                    let scoring = ScoreCalculator.Teleop.getScore({ performance: team });
                    if (scoring < lowestOffense) {
                        lowestOffense = scoring;
                        lowestOffenseIndex = index;
                    }
                });
                this.teamPerformances.forEach((team, index) => {
                    if (lowestOffenseIndex == index) return;
                    team.defense.played = false;
                    team.defense.rating = "";
                });
            }

            // Deduct score of a defending team
            this.teamPerformances.forEach((team) => {
                if (team.defense.played) {
                    SimulationInformation.deductDefenderScore(team);
                }
            });
        }
    }

    /**
     * Calculates and caches this alliance's score
     * @param {*} opposingAlliance The opposing AllianceDetails object. It's passed here so that the
     * simulation results aren't forced to cache the info
     */
    getScores(opposingAlliance) {
        this.teamPerformances.forEach(team => {
            this.autoScore += ScoreCalculator.Auto.getScore({ performance: team });
            this.teleopScore += ScoreCalculator.Teleop.getScore({ performance: team });
            this.endgameScore += ScoreCalculator.Endgame.getScore({ performance: team });
        });
        if (typeof SimulationInformation.adjustScoring !== 'undefined') SimulationInformation.adjustScoring(this, opposingAlliance);  // apply predicted score boosting specific to game
        this.score = this.autoScore + this.teleopScore + this.endgameScore;
    }

    getRPs() {
        SimulationInformation.getRPs(this.teamPerformances, this.gameStats);
    }
}

/**
 * Contains constant alliance statistics that would be relevant in ANY game
 */
const BaseAllianceSimulationResults = {
    winRate: 0,
    scoreRange: { min: 1000, max: -1000, avg: 0 },
    marginRange: { min: 1000, max: -1000, avg: 0 },
    RPFreq: [0, 0, 0, 0, 0]
};