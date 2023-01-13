import date from 'date-and-time';
import TeamData from "data/TeamData";
import { getTeamData } from "data/SearchData";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2022";
import ScoreCalculator from "data/game_specific/ScoreCalculator/2022";

/**
 * Simulates an FRC match with any 3 v 3 teams.
 */
export default class Simulator {
    redTeams = [];              // Team objects for red alliance
    blueTeams = [];             // Team objects for blue alliance
    results;                    // Array of resulting simulated matches
    simulations;                // # of simulations to run
    applyDefense;               // Whether to use defense or not
    confidence;                 // A number between 0 and 1 representing the simulator's confidence in the results based on number of matches submitted
    DEFAULT_INFLUENCE =  1.5;   // The default influence value to give to biasedRandom
    BIAS_METHOD = "median";     // The bias method to use on the random number generator
    RNG_SEED = "seedageddon";   // The seed to feed into the random number generator

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
            data: [],
            tieRate: 0,
            red: {
                teamNumbers: redTeamNumbers,
                winRate: 0,
                scoreRange: { min: 1000, max: -1000, avg: 0 },
                marginRange: { min: 1000, max: -1000, avg: 0 },
                cargoRPRate: 0,
                climbRPRate: 0,
                RPFreq: [0, 0, 0, 0, 0],
                endgameCeiling: 0,
                insights: {
                    endgameAboveThreshold: { threshold: 16, count: 0, wins: 0, string: "endgame" },
                    endgameBelowThreshold: { threshold: 15, count: 0, wins: 0, string: "endgame" },
                    autoAboveThreshold: { threshold: 14, count: 0, wins: 0, string: "autonomous" },
                    outscoredEndgame: { count: 0, wins: 0, string: "endgame" },
                    outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
                    outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
                }
            },
            blue: {
                teamNumbers: blueTeamNumbers,
                winRate: 0,
                scoreRange: { min: 1000, max: -1000, avg: 0 },
                marginRange: { min: 1000, max: -1000, avg: 0 },
                cargoRPRate: 0,
                climbRPRate: 0,
                RPFreq: [0, 0, 0, 0, 0],
                endgameCeiling: 0,
                insights: {
                    endgameAboveThreshold: { threshold: 16, count: 0, wins: 0, string: "endgame" },
                    endgameBelowThreshold: { threshold: 15, count: 0, wins: 0, string: "endgame" },
                    autoAboveThreshold: { threshold: 14, count: 0, wins: 0, string: "autonomous" },
                    outscoredEndgame: { count: 0, wins: 0, string: "endgame" },
                    outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
                    outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
                }
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
    async run(callback, status = count => {}) {
        // Seed a random number generator
        var seededRandom = require('seedrandom');
        var rng = seededRandom(this.RNG_SEED);

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
         * Finds the minimum, maximum, average, and median for a scoring category of a team. Also finds the number of
         * occurrances of the lowest value.
         * @param {Team} team The team object
         * @param {string} key The part of the game (i.e. auto, teleop)
         * @param {string} subkey The scoring category (i.e. cargoLow)
         * @returns A object with keys for min, max, avg, and lowFreq
         */
        const getRange = (team, key, subkey) => {
            let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0, medianArray = [], offset = 0;

            team.data.forEach(match => {
                let score = match.performance[key][subkey];
                let negate = false;
                if (key == "endgame" && subkey == "state") {
                    score = ScoreCalculator.Endgame.getNumericalLevel(match);
                    if (!match.performance.endgame.failedAttempt && score == 0) {
                        // Don't hold this robot at fault for not attempting to climb
                        //offset += .8;
                        //negate = true;
                    }
                }
                min = Math.min(score, min);
                max = Math.max(score, max);
                if (!negate) {
                    avg += score;
                    medianArray.push(score);
                }
            });

            team.data.forEach(match => {
                if (match.performance[key][subkey] == min) lowFreq ++;
            })

            medianArray.sort((a, b) => a - b);
            let median = (medianArray.length % 2 != 0 ? 
                medianArray[Math.floor(medianArray.length / 2)] 
                : 
                (medianArray[medianArray.length / 2] + medianArray[medianArray.length / 2 - 1]) / 2
            )
            
            avg = avg / (team.data.length - offset);
            if (key == "endgame" && subkey == "state") avg = Math.max(Math.min(4, avg), 0);

            return { min, max, avg, median, lowFreq };
        }

        /**
         * Gets all the match information for a team's contribution. Accounts for breakdowns, penalties, etc. Also calculates
         * the ODDS that a team will play defense and with what STRENGTH, but does NOT actually use these at all.
         * @param {Team} team The team to calculate for
         * @param {boolean} useRandom Should always be TRUE unless getting a one-off match result that is based only on averages
         * @param {string} biasMethod Used to determine the range with which to bias the number generator. Should be either "avg" or "median"
         * and doesn't make use of rng
         * @returns A Performance-like object (see performanceObject for more info)
         */
        const getTeamContribution = (team, useRandom = true, biasMethod = "avg") => {
            let result = performanceObject();
            result.teamNumber = team.number;

            // Get auto score
            let autoCargoLowRange = getRange(team, "auto", "cargoLow");
            let autoCargoHighRange = getRange(team, "auto", "cargoHigh");
            result.auto.cargoLow = Math.round(!useRandom ? autoCargoLowRange.avg : biasedRandom(autoCargoLowRange.min, autoCargoLowRange.max, autoCargoLowRange[biasMethod], this.DEFAULT_INFLUENCE));
            result.auto.cargoHigh = Math.round(!useRandom ? autoCargoHighRange.avg : biasedRandom(autoCargoHighRange.min, autoCargoHighRange.max, autoCargoHighRange[biasMethod], this.DEFAULT_INFLUENCE));
            if (result.auto.cargoLow + result.auto.cargoHigh > 2) result.auto.taxi = true; else {
                // If team used more than 2 cargo, they had to have left the tarmac... if not then figure it out ourselves
                let taxis = 0;
                team.data.forEach(match => taxis += match.performance.auto.taxi ? 1 : 0);
                result.auto.taxi = !useRandom ? (taxis / team.data.length > .5) : rng() < (taxis / team.data.length);
            }

            // Get teleop score
            let teleopCargoLowRange = getRange(team, "teleop", "cargoLow");
            let teleopCargoHighRange = getRange(team, "teleop", "cargoHigh");
            result.teleop.cargoLow = Math.round(!useRandom ? teleopCargoLowRange.avg : biasedRandom(teleopCargoLowRange.min, teleopCargoLowRange.max, teleopCargoLowRange[biasMethod], this.DEFAULT_INFLUENCE));
            result.teleop.cargoHigh = Math.round(!useRandom ? teleopCargoHighRange.avg : biasedRandom(teleopCargoHighRange.min, teleopCargoHighRange.max, teleopCargoHighRange[biasMethod], this.DEFAULT_INFLUENCE));
            
            // Get endgame
            let ef = {};    // Endgame frequency, storing # of times each endgame occurred
            ef[EndgameResult.NONE] = 0;
            ef[EndgameResult.LOW_RUNG] = 0;
            ef[EndgameResult.MID_RUNG] = 0;
            ef[EndgameResult.HIGH_RUNG] = 0;
            ef[EndgameResult.TRAVERSAL_RUNG] = 0;
            team.data.forEach(match => ef[match.performance.endgame.state] ++);
            result.endgame.tendency = JSON.parse(JSON.stringify(ef)); // new property- only invoked in cases where more than 2 teams tries to climb to same level as this team

            if (useRandom) {
                let endgameRange = getRange(team, "endgame", "state");
                result.endgame.state = ScoreCalculator.Endgame.getLevelFromNumber(Math.round(biasedRandom(endgameRange.min, endgameRange.max, endgameRange["median"], 0)));
            } else {
                let mostCommonEndgame = EndgameResult.NONE;
                let occurrances = 0;
                Object.keys(ef).forEach(endgame => {
                    if (ef[endgame] >= occurrances) {
                        mostCommonEndgame = endgame;
                        occurrances = ef[endgame];
                    }
                });
                result.endgame.state = mostCommonEndgame;
            }

            // Get defense tendencies
            if (this.applyDefense) {
                let defensivePlays = 0;
                let strongDefensePlays = 0;
                team.data.forEach(match => {
                    if (match.performance.defense.played) {
                        defensivePlays ++;
                        if (match.performance.defense.rating == "Strong") strongDefensePlays ++;
                    }
                });
                result.defense.tendency = defensivePlays / team.data.length;    // new property- only invoked in cases where more than 1 team says yes to play defense
                result.defense.played = rng() < result.defense.tendency;        // TODO add option for this to not be random
                result.defense.rating = rng() < (strongDefensePlays / defensivePlays) ? "Strong" : "Weak";
            }

            return result;
        }



        // This is where each simulation is run
        let redWins = 0, blueWins = 0, ties = 0;
        for (let progress = 0; progress < this.simulations; progress ++) {
            let redPerformances = [
                getTeamContribution(this.redTeams[0], true, this.BIAS_METHOD),
                getTeamContribution(this.redTeams[1], true, this.BIAS_METHOD),
                getTeamContribution(this.redTeams[2], true, this.BIAS_METHOD),
            ];
            let bluePerformances = [
                getTeamContribution(this.blueTeams[0], true, this.BIAS_METHOD),
                getTeamContribution(this.blueTeams[1], true, this.BIAS_METHOD),
                getTeamContribution(this.blueTeams[2], true, this.BIAS_METHOD),
            ];
            let matchDetails = new MatchDetails(redPerformances, bluePerformances, this.applyDefense);
            if (matchDetails.winner == "Red") redWins ++;
            else if (matchDetails.winner == "Blue") blueWins ++;
            else ties ++;

            // Compile stats to running averages and calculate team-specific insight data related to this match
            const calcRunningAverages = color => {

                // Running averages/ranges
                this.results[color].RPFreq[matchDetails[color].matchRP + (matchDetails[color].cargoRP ? 1 : 0) + (matchDetails[color].climbRP ? 1 : 0)] ++;
                this.results[color].cargoRPRate += matchDetails[color].cargoRP ? 1 : 0;
                this.results[color].climbRPRate += matchDetails[color].climbRP ? 1 : 0;
                this.results[color].endgameCeiling = Math.max(this.results[color].endgameCeiling, matchDetails[color].endgameScore);

                this.results[color].scoreRange.avg += matchDetails[color].score;
                this.results[color].scoreRange.min = Math.min(matchDetails[color].score, this.results[color].scoreRange.min);
                this.results[color].scoreRange.max = Math.max(matchDetails[color].score, this.results[color].scoreRange.max);
                if (matchDetails.winner.toLowerCase() == color) {
                    let margin = matchDetails[color].score - matchDetails[color == "red" ? "blue" : "red"].score;
                    this.results[color].marginRange.avg += margin;
                    this.results[color].marginRange.min = Math.min(margin, this.results[color].marginRange.min);
                    this.results[color].marginRange.max = Math.max(margin, this.results[color].marginRange.max);
                }

                // Insights
                if (matchDetails[color].endgameScore > this.results[color].insights.endgameAboveThreshold.threshold) {
                    this.results[color].insights.endgameAboveThreshold.count ++;
                    if (matchDetails.winner.toLowerCase() == color) this.results[color].insights.endgameAboveThreshold.wins ++
                }
                if (matchDetails[color].endgameScore < this.results[color].insights.endgameBelowThreshold.threshold) {
                    this.results[color].insights.endgameBelowThreshold.count ++;
                    if (matchDetails.winner.toLowerCase() == color) this.results[color].insights.endgameBelowThreshold.wins ++
                }
                if (matchDetails[color].autoScore > this.results[color].insights.autoAboveThreshold.threshold) {
                    this.results[color].insights.autoAboveThreshold.count ++;
                    if (matchDetails.winner.toLowerCase() == color) this.results[color].insights.autoAboveThreshold.wins ++
                }
            }
            calcRunningAverages("red");
            calcRunningAverages("blue");
            
            // Calculate inter-team insights related to this match
            let color = matchDetails.red.autoScore > matchDetails.blue.autoScore ? "red" : "blue";
            this.results[color].insights.outscoredAuto.count ++;
            this.results[color].insights.outscoredAuto.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;

            color = matchDetails.red.teleopScore > matchDetails.blue.teleopScore ? "red" : "blue";
            this.results[color].insights.outscoredTeleop.count ++;
            this.results[color].insights.outscoredTeleop.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;

            color = matchDetails.red.endgameScore > matchDetails.blue.endgameScore ? "red" : "blue";
            this.results[color].insights.outscoredEndgame.count ++;
            this.results[color].insights.outscoredEndgame.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;

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
        this.results.red.winRate = redWins / this.simulations;
        this.results.blue.winRate = blueWins / this.simulations;
        this.results.tieRate = ties / this.simulations;
        this.results.red.scoreRange.avg /= this.simulations;
        this.results.blue.scoreRange.avg /= this.simulations;
        this.results.red.cargoRPRate /= this.simulations;
        this.results.red.climbRPRate /= this.simulations;
        this.results.blue.cargoRPRate /= this.simulations;
        this.results.blue.climbRPRate /= this.simulations;

        for (let i = 0; i <= 4; i ++) {
            this.results.red.RPFreq[i] = this.results.red.RPFreq[i] / this.simulations * 100;
            this.results.blue.RPFreq[i] = this.results.blue.RPFreq[i] / this.simulations * 100;
        }

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
            this.applyDefense
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