import ScoreCalculator from "data/game_specific/ScoreCalculator/202X";
import performanceObject from "data/game_specific/performanceObject/202X";

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        autoRPRate: 0,
        teleopRPRate: 0
    },

    /**
     * Injected into the simulator alliance objects under the key `insights` and is used accordingly in the Insights section
     */
    allianceInsights: {
        autoAboveThreshold: { threshold: 16, count: 0, wins: 0, string: "autonomous" },
        teleopAboveThreshold: { threshold: 32, count: 0, wins: 0, string: "teleop" },
        outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
        outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
    },

    /**
     * A function that gets game-specific variables for a single match, typically for ranking point related tracking.
     * Injected into the `AllianceDetails` class.
     * @returns An object with properties `autoRP` and `teleopRP`
     */
    singleMatchAllianceDetails: {
        autoRP: false,
        teleopRP: false
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        // Check for autonomous RP
        let autoPieces = 0, autoCrosses = 0;
        teamPerformances.forEach(team => autoPieces += ScoreCalculator.Auto.getPieces({ performance: team }));
        teamPerformances.forEach(team => autoCrosses += Number(team.auto.cross));
        gameStats.autoRP = autoPieces >= 3 && autoCrosses >= 2;

        // Check for teleop RP
        let teleopPieces = 0;
        teamPerformances.forEach(team => teleopPieces += ScoreCalculator.Teleop.getPieces({ performance: team }));
        gameStats.teleopRP = teleopPieces >= 18;
    },

    /**
     * If a game ends in a tie, this method can determine which alliance would win the tie.
     * @param {*} red Red alliance team data
     * @param {*} blue Blue alliance team data
     * @returns The alliance team data object that won the tiebreakers; if a dead-even tie, returns `{ color: "Tie" }`
     */
    getTiebreakWinner: (red, blue) => {
        if (red.autoScore != blue.autoScore) return red.autoScore > blue.autoScore ? red : blue;
        return { color: "Tie" };
    },
    
    /**
     * Finds the minimum, maximum, average, and median for a scoring category of a team. Also finds the number of
     * occurrances of the lowest value.
     * @param {Team} team The team object
     * @param {string} key The part of the game (i.e. auto, teleop)
     * @param {string} subkey The scoring category (i.e. cargoLow)
     * @returns A object with keys for min, max, avg, and lowFreq
     */
    getRange: (team, key, subkey) => {
        let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0, medianArray = [], offset = 0;

        team.data.forEach(match => {
            let score = match.performance[key][subkey];
            let negate = false;
            if (key == "endgame" && subkey == "state") {
                /*score = ScoreCalculator.Endgame.getNumericalLevel(match);
                if (!match.performance.endgame.failedAttempt && score == 0) {
                    // Don't hold this robot at fault for not attempting to climb
                    //offset += .8;
                    //negate = true;
                }*/
                // Sample game does not include an endgame
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
    },

    /**
     * Gets all the match information for a team's contribution. Accounts for breakdowns, penalties, etc. Also calculates
     * the ODDS that a team will play defense and with what STRENGTH, but does NOT actually use these at all.
     * @param {object} func A dictionary of universal functions for generating numbers
     * @param {Team} team The team to calculate for
     * @param {boolean} useRandom Should always be TRUE unless getting a one-off match result that is based only on averages
     * @param {string} biasMethod Used to determine the range with which to bias the number generator. Should be either "avg" or "median"
     * and doesn't make use of rng
     * @returns A Performance-like object (see performanceObject for more info)
     */
    getTeamContribution: (funcs, team, useRandom = true, biasMethod = "avg") => {
        const { getRange, biasedRandom, rng, config } = funcs;
        let result = performanceObject();
        result.teamNumber = team.number;

        // Get auto score
        let autoPiecesRange = getRange(team, "auto", "pieces");
        result.auto.pieces = Math.round(!useRandom ? autoPiecesRange.avg : biasedRandom(autoPiecesRange.min, autoPiecesRange.max, autoPiecesRange[biasMethod], config.defaultInfluence));
        if (result.auto.pieces > 1) result.auto.cross = true; else {
            // If team used more than 1 piece, they had to have auto-crossed... if not then figure it out ourselves
            let crosses = 0;
            team.data.forEach(match => crosses += match.performance.auto.cross ? 1 : 0);
            result.auto.cross = !useRandom ? (crosses / team.data.length > .5) : rng() < (crosses / team.data.length);
        }

        // Get teleop score
        let teleopPiecesRange = getRange(team, "teleop", "pieces");
        result.teleop.pieces = Math.round(!useRandom ? teleopPiecesRange.avg : biasedRandom(teleopPiecesRange.min, teleopPiecesRange.max, teleopPiecesRange[biasMethod], config.defaultInfluence));

        // This is where endgame would be determined... IF THIS GAME HAD IT

        // Get defense tendencies
        if (config.applyDefense) {
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
    },

    /**
     * Runs BEFORE the match is decided and BEFORE the `postSimulationCalculations`, but AFTER
     * the performance objects for a match are generated.
     * @param {*} color The alliance color
     * @param {*} performances An array of performance objects, agnostic to color
     * @param {*} gameStats The `gameStats` property of the `AllianceDetails` class
     */
    preCompilationCalculations: (color, performances, gameStats) => {},

    /**
     * Given the performance object of a defender, removes game pieces from their score, assuming that their defense
     * during the match reduces their capacity to score points.
     * @param {performanceObject} performance The `performanceObject` of the defender
     */
    deductDefenderScore: (performance) => {},

    /**
     * Reduces the scoring output of a team being targeted by a defender.
     * @param {performanceObject} performanceDefender The `performanceObject` of the defender
     * @param {performanceObject} performanceTarget The `performanceObject` of the 
     */
    applyDefense: (performanceDefender, performanceTarget) => {

    },

    /**
     * Runs during every match of the simulator to tabulate certain running averages and insights.
     * @param {string} color The alliance color
     * @param {object} results The results object in the simulator
     * @param {MatchDetails} matchDetails The `MatchDetails` object
     */
    postSimulationCalculations: (color, results, matchDetails) => {
        // Game-specific running averages/rates
        results[color].RPFreq[matchDetails[color].matchRP + (matchDetails[color].gameStats.autoRP ? 1 : 0) + (matchDetails[color].gameStats.teleopRP ? 1 : 0)] ++;
        results[color].autoRPRate += matchDetails[color].gameStats.autoRP ? 1 : 0;
        results[color].teleopRPRate += matchDetails[color].gameStats.teleopRP ? 1 : 0;

        // Insights that are independent of what the opposing alliance did
        if (matchDetails[color].autoScore > results[color].insights.autoAboveThreshold.threshold) {
            results[color].insights.autoAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.autoAboveThreshold.wins ++
        }
        if (matchDetails[color].teleopScore > results[color].insights.teleopAboveThreshold.threshold) {
            results[color].insights.teleopAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.teleopAboveThreshold.wins ++
        }
    },

    /**
     * Runs during every match of the simulator to calculate any insights that require data across both alliances, such as an alliance being outscored.
     * @param {object} results The results object in the simulator
     * @param {MatchDetails} matchDetails The `MatchDetails` object
     */
    calcInterAllianceAverages: (results, matchDetails) => {
        let color = matchDetails.red.autoScore > matchDetails.blue.autoScore ? "red" : "blue";
        results[color].insights.outscoredAuto.count ++;
        results[color].insights.outscoredAuto.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;

        color = matchDetails.red.teleopScore > matchDetails.blue.teleopScore ? "red" : "blue";
        results[color].insights.outscoredTeleop.count ++;
        results[color].insights.outscoredTeleop.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;
    },

    /**
     * Any calculations that can only be run once the simulation is over, such as calculating averages.
     */
    postSimulation: (results, config) => {
        results.red.autoRPRate /= config.simulations;
        results.red.teleopRPRate /= config.simulations;
        results.blue.autoRPRate /= config.simulations;
        results.blue.teleopRPRate /= config.simulations;
    }
}

export default SimulationInformation;