import ScoreCalculator from "data/game_specific/ScoreCalculator/2022";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2022";

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        cargoRPRate: 0,
        climbRPRate: 0,
        endgameCeiling: 0,
    },

    /**
     * Injected into the simulator alliance objects under the key `insights` and is used accordingly in the Insights section
     */
    allianceInsights: {
        endgameAboveThreshold: { threshold: 16, count: 0, wins: 0, string: "endgame" },
        endgameBelowThreshold: { threshold: 15, count: 0, wins: 0, string: "endgame" },
        autoAboveThreshold: { threshold: 14, count: 0, wins: 0, string: "autonomous" },
        outscoredEndgame: { count: 0, wins: 0, string: "endgame" },
        outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
        outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
    },

    /**
     * A function that gets game-specific variables for a single match, typically for ranking point related tracking.
     * Injected into the `AllianceDetails` class.
     * @returns An object with properties `cargoRP`, `climbRP`, and `quintet`
     */
    singleMatchAllianceDetails: {
        quintet: false,
        cargoRP: false,
        climbRP: false
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        // Check if quintet was successful
        let autonCargo = 0;
        teamPerformances.forEach(team => autonCargo += ScoreCalculator.Auto.getPieces({ performance: team }));
        gameStats.quintet = autonCargo >= 5;

        // Check for cargo RP
        let teleopCargo = 0;
        teamPerformances.forEach(team => teleopCargo += ScoreCalculator.Teleop.getPieces({ performance: team }));
        gameStats.cargoRP = teleopCargo + autonCargo >= (gameStats.quintet ? 18 : 20);

        // Check for climb RP
        let climbScore = 0;
        teamPerformances.forEach(team => climbScore += ScoreCalculator.Endgame.getScore({ performance: team }));
        gameStats.climbRP = climbScore >= 16;
    },

    /**
     * If a game ends in a tie, this method can determine which alliance would win the tie.
     * @param {*} red Red alliance team data
     * @param {*} blue Blue alliance team data
     * @returns The alliance team data object that won the tiebreakers; if a dead-even tie, returns `{ color: "Tie" }`
     */
    getTiebreakWinner: (red, blue) => {
        if (red.endgameScore != blue.endgameScore) return red.endgameScore > blue.endgameScore ? red : blue;
        if (red.autoScore + red.teleopScore != blue.autoScore + blue.teleopScore) return red.autoScore + red.teleopScore > blue.autoScore + blue.teleopScore ? red : blue;
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
        let autoCargoLowRange = getRange(team, "auto", "cargoLow");
        let autoCargoHighRange = getRange(team, "auto", "cargoHigh");
        result.auto.cargoLow = Math.round(!useRandom ? autoCargoLowRange.avg : biasedRandom(autoCargoLowRange.min, autoCargoLowRange.max, autoCargoLowRange[biasMethod], config.defaultInfluence));
        result.auto.cargoHigh = Math.round(!useRandom ? autoCargoHighRange.avg : biasedRandom(autoCargoHighRange.min, autoCargoHighRange.max, autoCargoHighRange[biasMethod], config.defaultInfluence));
        if (result.auto.cargoLow + result.auto.cargoHigh > 2) result.auto.taxi = true; else {
            // If team used more than 2 cargo, they had to have left the tarmac... if not then figure it out ourselves
            let taxis = 0;
            team.data.forEach(match => taxis += match.performance.auto.taxi ? 1 : 0);
            result.auto.taxi = !useRandom ? (taxis / team.data.length > .5) : rng() < (taxis / team.data.length);
        }

        // Get teleop score
        let teleopCargoLowRange = getRange(team, "teleop", "cargoLow");
        let teleopCargoHighRange = getRange(team, "teleop", "cargoHigh");
        result.teleop.cargoLow = Math.round(!useRandom ? teleopCargoLowRange.avg : biasedRandom(teleopCargoLowRange.min, teleopCargoLowRange.max, teleopCargoLowRange[biasMethod], config.defaultInfluence));
        result.teleop.cargoHigh = Math.round(!useRandom ? teleopCargoHighRange.avg : biasedRandom(teleopCargoHighRange.min, teleopCargoHighRange.max, teleopCargoHighRange[biasMethod], config.defaultInfluence));
        
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
        results[color].RPFreq[matchDetails[color].matchRP + (matchDetails[color].gameStats.cargoRP ? 1 : 0) + (matchDetails[color].gameStats.climbRP ? 1 : 0)] ++;
        results[color].cargoRPRate += matchDetails[color].gameStats.cargoRP ? 1 : 0;
        results[color].climbRPRate += matchDetails[color].gameStats.climbRP ? 1 : 0;
        results[color].endgameCeiling = Math.max(results[color].endgameCeiling, matchDetails[color].endgameScore);

        // Insights that are independent of what the opposing alliance did
        if (matchDetails[color].endgameScore > results[color].insights.endgameAboveThreshold.threshold) {
            results[color].insights.endgameAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.endgameAboveThreshold.wins ++
        }
        if (matchDetails[color].endgameScore < results[color].insights.endgameBelowThreshold.threshold) {
            results[color].insights.endgameBelowThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.endgameBelowThreshold.wins ++
        }
        if (matchDetails[color].autoScore > results[color].insights.autoAboveThreshold.threshold) {
            results[color].insights.autoAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.autoAboveThreshold.wins ++
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

        color = matchDetails.red.endgameScore > matchDetails.blue.endgameScore ? "red" : "blue";
        results[color].insights.outscoredEndgame.count ++;
        results[color].insights.outscoredEndgame.wins += matchDetails.winner.toLowerCase() == color ? 1 : 0;
    },

    /**
     * Any calculations that can only be run once the simulation is over, such as calculating averages.
     */
    postSimulation: (results, config) => {
        results.red.cargoRPRate /= config.simulations;
        results.red.climbRPRate /= config.simulations;
        results.blue.cargoRPRate /= config.simulations;
        results.blue.climbRPRate /= config.simulations;
    }
}

export default SimulationInformation;