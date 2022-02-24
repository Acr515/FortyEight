import { getTeamData } from "../../SearchData";
import TeamData from "../../TeamData";
import performanceObject, { EndgameResult } from "../performanceObject/2022";
import ScoreCalculator from "../ScoreCalculator/2022";
import date from 'date-and-time';

/**
 * Simulates an FRC match with any 3 v 3 teams.
 */
export default class Simulator {
    redTeams = [];          // Team objects for red alliance
    blueTeams = [];         // Team objects for blue alliance
    results;                // Array of resulting simulated matches
    simulations;            // # of simulations to run
    applyDefense;           // Whether to use defense or not
    confidence;             // A number between 0 and 1 representing the simulator's confidence in the results based on number of matches submitted
    DEFAULT_INFLUENCE = 1;  // The default influence value to give to biasedRandom

    /**
     * Sets up the simulator. Defaults to using TeamData; use the other constructor if you have other data to use
     * @param {number[]} redTeamNumbers Array of red team #s
     * @param {number[]} blueTeamNumbers Array of blue team #s
     * @param {Team[]} dataset Defaults to TeamData
     */
    constructor(redTeamNumbers, blueTeamNumbers, simulations, applyDefense, dataset = TeamData) {
        this.simulations = simulations;
        this.applyDefense = applyDefense;
        redTeamNumbers.forEach(num => this.redTeams.push(getTeamData(num, dataset)));
        blueTeamNumbers.forEach(num => this.blueTeams.push(getTeamData(num, dataset)));
        this.results = {
            simulations,
            applyDefense,
            redTeamNumbers,
            blueTeamNumbers,
            data: [],
            redWinRate: 0,
            blueWinRate: 0,
            tieRate: 0,
            redRPFreq: [0, 0, 0, 0, 0],
            blueRPFreq: [0, 0, 0, 0, 0],
            red: {  // full implementations of these likely to come later
                scoreRange: { min: 1000, max: -1000, avg: 0 },
                marginRange: { min: 1000, max: -1000, avg: 0 },
            },
            blue: { // full implementations of these likely to come later
                scoreRange: { min: 1000, max: -1000, avg: 0 },
                marginRange: { min: 1000, max: -1000, avg: 0 },
            },
            timestamp: date.format(new Date(), "M/D/YY, h:mm A")
        };
    }

    /**
     * Runs the simulation.
     * @param {function} callback Runs when the simulation is finished
     * @param {function} status Runs periodically to report status
     */
    run(callback, status = count => {}) {
        // Seed a random number generator
        var seededRandom = require('seedrandom');
        var rng = seededRandom('ramageddon');

        // All the functions used for the simulation are below

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
        }

        /**
         * Finds the minimum, maximum, and average values for a scoring category of a team. Also finds the number of
         * occurrances of the lowest value.
         * @param {Team} team The team object
         * @param {string} key The part of the game (i.e. auto, teleop)
         * @param {string} subkey The scoring category (i.e. cargoLow)
         * @returns A object with keys for min, max, avg, and lowFreq
         */
        const getRange = (team, key, subkey) => {
            let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0;

            team.data.forEach(match => {
                let score = match.performance[key][subkey];
                if (key == "endgame" && subkey == "state") ScoreCalculator.Endgame.getNumericalLevel(match);
                min = Math.min(score, min);
                max = Math.max(score, max);
                avg += score;
            });

            team.data.forEach(match => {
                if (match.performance[key][subkey] == min) lowFreq ++;
            })

            return { min, max, avg: (avg / team.data.length), lowFreq };
        }

        /**
         * Gets all the match information for a team's contribution. Accounts for breakdowns, penalties, etc. Also calculates
         * the ODDS that a team will play defense and with what STRENGTH, but does NOT actually use these at all.
         * @param {Team} team The team to calculate for
         * @returns A Performance-like object (see performanceObject for more info)
         */
        const getTeamContribution = (team) => {
            let result = performanceObject();
            result.teamNumber = team.number;

            // Get auto score
            let autoCargoLowRange = getRange(team, "auto", "cargoLow");
            let autoCargoHighRange = getRange(team, "auto", "cargoHigh");
            result.auto.cargoLow = Math.round(biasedRandom(autoCargoLowRange.min, autoCargoLowRange.max, autoCargoLowRange.avg, this.DEFAULT_INFLUENCE));
            result.auto.cargoHigh = Math.round(biasedRandom(autoCargoHighRange.min, autoCargoHighRange.max, autoCargoHighRange.avg, this.DEFAULT_INFLUENCE));
            if (result.auto.cargoLow + result.auto.cargoHigh > 2) result.auto.taxi = true; else {
                // If team used more than 2 cargo, they had to have left the tarmac... if not then figure it out ourselves
                let taxis = 0;
                team.data.forEach(match => taxis += match.performance.auto.taxi ? 1 : 0);
                result.auto.taxi = rng() < (taxis / team.data.length);
            }

            // Get teleop score
            let teleopCargoLowRange = getRange(team, "teleop", "cargoLow");
            let teleopCargoHighRange = getRange(team, "teleop", "cargoHigh");
            result.teleop.cargoLow = Math.round(biasedRandom(teleopCargoLowRange.min, teleopCargoLowRange.max, teleopCargoLowRange.avg, this.DEFAULT_INFLUENCE));
            result.teleop.cargoHigh = Math.round(biasedRandom(teleopCargoHighRange.min, teleopCargoHighRange.max, teleopCargoHighRange.avg, this.DEFAULT_INFLUENCE));
            
            // Get endgame
            let ef = {};    // Endgame frequency, storing # of times each endgame occurred
            ef[EndgameResult.NONE] = 0;
            ef[EndgameResult.LOW_RUNG] = 0;
            ef[EndgameResult.MID_RUNG] = 0;
            ef[EndgameResult.HIGH_RUNG] = 0;
            ef[EndgameResult.TRAVERSAL_RUNG] = 0;
            team.data.forEach(match => ef[match.performance.endgame.state] ++);
            result.endgame.tendency = JSON.parse(JSON.stringify(ef)); // new property- only invoked in cases where more than 2 teams tries to climb to same level as this team

            let endgamePicker = rng() * team.data.length;
            if (endgamePicker < ef[EndgameResult.NONE])
                result.endgame.state = EndgameResult.NONE;
            else {
                ef[EndgameResult.LOW_RUNG] += ef[EndgameResult.NONE];
                if (endgamePicker < ef[EndgameResult.LOW_RUNG]) 
                    result.endgame.state = EndgameResult.LOW_RUNG;
                else {
                    ef[EndgameResult.MID_RUNG] += ef[EndgameResult.LOW_RUNG];
                    if (endgamePicker < ef[EndgameResult.MID_RUNG])
                        result.endgame.state = EndgameResult.MID_RUNG;
                    else {
                        ef[EndgameResult.HIGH_RUNG] += ef[EndgameResult.MID_RUNG];
                        if (endgamePicker < ef[EndgameResult.HIGH_RUNG])
                            result.endgame.state = EndgameResult.HIGH_RUNG;
                        else
                            result.endgame.state = EndgameResult.TRAVERSAL_RUNG;
                    }
                }
            }

            // Get defense tendencies
            let defensivePlays = 0;
            let strongDefensePlays = 0;
            team.data.forEach(match => {
                if (match.performance.defense.played) {
                    defensivePlays ++;
                    if (match.performance.defense.rating == "Strong") strongDefensePlays ++;
                }
            });
            result.defense.tendency = defensivePlays / team.data.length;    // new property- only invoked in cases where more than 1 team says yes to play defense
            result.defense.played = rng() < result.defense.tendency;
            result.defense.rating = rng() < (strongDefensePlays / defensivePlays) ? "Strong" : "Weak"

            return result;
        }



        // This is where each simulation is run
        //async function runSimulations() {
            let redWins = 0, blueWins = 0, ties = 0;
            for (let progress = 0; progress < this.simulations; progress ++) {
                let redPerformances = [
                    getTeamContribution(this.redTeams[0]),
                    getTeamContribution(this.redTeams[1]),
                    getTeamContribution(this.redTeams[2]),
                ];
                let bluePerformances = [
                    getTeamContribution(this.blueTeams[0]),
                    getTeamContribution(this.blueTeams[1]),
                    getTeamContribution(this.blueTeams[2]),
                ];
                let matchDetails = new MatchDetails(redPerformances, bluePerformances, this.applyDefense);
                if (matchDetails.winner == "Red") redWins ++;
                else if (matchDetails.winner == "Blue") blueWins ++;
                else ties ++;

                // Compile stats to running averages
                this.results.redRPFreq[matchDetails.red.matchRP + (matchDetails.red.cargoRP ? 1 : 0) + (matchDetails.red.climbRP ? 1 : 0)] ++;
                this.results.blueRPFreq[matchDetails.blue.matchRP + (matchDetails.blue.cargoRP ? 1 : 0) + (matchDetails.blue.climbRP ? 1 : 0)] ++;

                this.results.red.scoreRange.avg += matchDetails.red.score;
                this.results.red.scoreRange.min = Math.min(matchDetails.red.score, this.results.red.scoreRange.min);
                this.results.red.scoreRange.max = Math.max(matchDetails.red.score, this.results.red.scoreRange.max);
                this.results.blue.scoreRange.avg += matchDetails.blue.score;
                this.results.blue.scoreRange.min = Math.min(matchDetails.blue.score, this.results.blue.scoreRange.min);
                this.results.blue.scoreRange.max = Math.max(matchDetails.blue.score, this.results.blue.scoreRange.max);

                if (matchDetails.winner == "Red") {
                    let margin = matchDetails.red.score - matchDetails.blue.score;
                    this.results.red.marginRange.avg += margin;
                    this.results.red.marginRange.min = Math.min(margin, this.results.red.marginRange.min);
                    this.results.red.marginRange.max = Math.max(margin, this.results.red.marginRange.max);
                } else if (matchDetails.winner == "Blue") {
                    let margin = matchDetails.blue.score - matchDetails.red.score;
                    this.results.blue.marginRange.avg += margin;
                    this.results.blue.marginRange.min = Math.min(margin, this.results.blue.marginRange.min);
                    this.results.blue.marginRange.max = Math.max(margin, this.results.blue.marginRange.max);
                }

                this.results.data.push(matchDetails);
                status(progress);
            }
            
            if (redWins > 0) {
                this.results.red.marginRange.avg /= redWins; 
                this.results.red.marginRange.min /= redWins; 
                this.results.red.marginRange.max /= redWins; 
            } else {
                this.results.red.marginRange.min = 0;
                this.results.blue.marginRange.max = 0;
            }
            if (blueWins > 0) {
                this.results.blue.marginRange.avg /= blueWins; 
                this.results.blue.marginRange.min /= blueWins; 
                this.results.blue.marginRange.max /= blueWins; 
            } else {
                this.results.red.marginRange.min = 0;
                this.results.blue.marginRange.max = 0;
            }
            this.results.redWinRate = redWins / this.simulations;
            this.results.blueWinRate = blueWins / this.simulations;
            this.results.tieRate = ties / this.simulations;
            this.results.red.scoreRange.avg /= this.simulations;
            this.results.blue.scoreRange.avg /= this.simulations;

            for (let i = 0; i <= 4; i ++) {
                this.results.redRPFreq[i] /= this.simulations;
                this.results.blueRPFreq[i] /= this.simulations;
            }

            console.log("SIMULATOR: Done.");
            callback(this.results);
        //}
        //runSimulations();
    }
}

/**
 * Synthesizes insights and total scoring information.
 */
class MatchDetails {
    red = {};
    blue = {};
    winner;

    constructor(redPerformances, bluePerformances, useDefense) {
        this.red = new AllianceDetails(redPerformances, "Red", useDefense);
        this.blue = new AllianceDetails(bluePerformances, "Blue", useDefense);

        // Apply defense
        if (useDefense) {
            // TODO implement
        }

        // Calculate final scores and RP totals
        this.red.getScores();
        this.blue.getScores();
        this.red.getRPs();
        this.blue.getRPs();
        this.winner = this.getWinner();
        if (this.winner == "Red") this.red.matchRP = 2;
        else if (this.winner == "Blue") this.blue.matchRP = 2;
        else {
            this.red.matchRP = 1;
            this.blue.matchRP = 1;
        }
    }

    getWinner() {
        if (this.red.score == this.blue.score) return "Tie";    // Tie
        return this.red.score > this.blue.score ? "Red" : "Blue"
    }

    // Breaks a tie and declares a winner. Mostly exists for novelty but maybe it'd be useful
    getTiebreakWinner() {
        if (this.red.endgameScore != this.blue.endgameScore) return this.red.endgameScore > this.blue.endgameScore ? this.red : this.blue;
        if (this.red.autoScore + this.red.teleopScore != this.blue.autoScore + this.blue.teleopScore) return this.red.autoScore + this.red.teleopScore > this.blue.autoScore + this.blue.teleopScore ? this.red : this.blue;
        return { color: "Tie" };
    }
}

/**
 * Stores information about each alliance's performance and settles disputes over who can climb to where and who will defend
 */
class AllianceDetails {
    color;
    teamPerformances;
    score = 0;
    autoScore = 0;
    teleopScore = 0;
    endgameScore = 0;
    quintet = false;
    cargoRP = false;
    climbRP = false;
    matchRP = 0;

    constructor(performances, color, useDefense) {
        this.teamPerformances = performances;
        this.color = color;

        // Check if all three robots are climbing to the same level
        this.teamPerformances.forEach(team => {
            // TODO implement
        });

        // Check if two or more robots are trying to play defense
        if (useDefense) {
            let defenseTeams = [];
            this.teamPerformances.forEach((team, index) => {
                if (team.defense.played) defenseTeams.push(index);
            });
            if (defenseTeams.length > 1) {
                lowestOffense = 1000, lowestOffenseIndex = -1;
                defenseTeams.forEach(index => {
                    let team = this.teamPerformances[index];
                    let scoring = ScoreCalculator.Teleop.getScore({ performance: team });
                    if (scoring < lowestOffense) {
                        lowestOffense = scoring;
                        lowestOffensiveIndex = index;
                    }
                });
                this.teamPerformances.forEach((team, index) => {
                    if (lowestOffensiveIndex == index) return;
                    team.defense.played = false;
                    team.defense.rating = "";
                });
            }

            // Deduct score of a defending team
            this.teamPerformances.forEach((team, index) => {
                if (team.defense.played) {
                    team.teleop.cargoLow = Math.floor(team.teleop.cargoLow / 2);
                    team.teleop.cargoHigh = Math.floor(team.teleop.cargoHigh / 2);
                }
            });
        }
    }

    getScores() {
        this.teamPerformances.forEach(team => {
            this.autoScore += ScoreCalculator.Auto.getScore({ performance: team });
            this.teleopScore += ScoreCalculator.Teleop.getScore({ performance: team });
            this.endgameScore += ScoreCalculator.Endgame.getScore({ performance: team });
        });
        this.score = this.autoScore + this.teleopScore + this.endgameScore;
    }

    getRPs() {
        // Check if quintet was successful
        let autonCargo = 0;
        this.teamPerformances.forEach(team => autonCargo += ScoreCalculator.Auto.getPieces({ performance: team }));
        this.quintet = autonCargo >= 5;

        // Check for cargo RP
        let teleopCargo = 0;
        this.teamPerformances.forEach(team => teleopCargo += ScoreCalculator.Teleop.getPieces({ performance: team }));
        this.cargoRP = teleopCargo + autonCargo >= (this.quintet ? 18 : 20);

        // Check for climb RP
        let climbScore = 0;
        this.teamPerformances.forEach(team => climbScore += ScoreCalculator.Endgame.getScore({ performance: team }));
        this.climbRP = climbScore >= 16;
    }
}