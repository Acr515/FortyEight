import ScoreCalculator from "data/game_specific/ScoreCalculator/2026";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2026";
import gameDataObject from "util/gameData/2026";

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        energizedRPRate: 0,
        superchargedRPRate: 0,
        traversalRPRate: 0,
        averageCycles: 0,
        averageEndgame: 0,
        defensePiecesPrevented: 0,
        defenseOccurrences: 0,
    },

    /**
     * Injected into the simulator alliance objects under the key `insights` and is used accordingly in the Insights section
     */
    allianceInsights: {
        autoAboveThreshold: { threshold: 30, count: 0, wins: 0, string: "autonomous" },
        endgameAboveThreshold: { threshold: gameDataObject.config.bargeRPThreshold, count: 0, wins: 0, string: "endgame" },
        outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
        outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
    },

    /**
     * A function that gets game-specific variables for a single match, typically for ranking point related tracking.
     * Injected into the `AllianceDetails` class.
     * @returns An object with properties `melodyRP` and `ensembleRP` along with other key properties related to RPs
     */
    singleMatchAllianceDetails: {
        energizedRP: false,                 // RP for energized fuel threshold
        superchargedRP: false,             // RP for supercharged fuel threshold
        traversalRP: false                  // RP for total tower points
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        let totalFuel = 0, totalTower = 0;
        for (const team of teamPerformances) {
            totalFuel += ScoreCalculator.Auto.getPieces({ performance: team }) + ScoreCalculator.Teleop.getPieces({ performance: team });
            totalTower += (team.auto.state ? 15 : 0) + ScoreCalculator.Endgame.getScore({ performance: team });
        }
        gameStats.energizedRP = totalFuel >= gameDataObject.config.energizedRPThreshold;
        gameStats.superchargedRP = totalFuel >= gameDataObject.config.superchargedRPThreshold;
        gameStats.traversalRP = totalTower >= gameDataObject.config.traversalRPThreshold;
    },

    /**
     * If a game ends in a tie, this method can determine which alliance would win the tie.
     * @param {*} red Red alliance team data
     * @param {*} blue Blue alliance team data
     * @returns The alliance team data object that won the tiebreakers; if a dead-even tie, returns `{ color: "Tie" }`
     */
    getTiebreakWinner: (red, blue) => {
        // This isn't even used anywhere so I'm not gonna implement it right now lol
        return { color: "Tie" };
    },
    
    /**
     * Finds the minimum, maximum, average, and median for a scoring category of a team. Also finds the number of
     * occurrences of the lowest value.
     * @param {Team} team The team object
     * @param {string} key The part of the game (i.e. auto, teleop)
     * @param {string} subkey The scoring category (i.e. cargoLow)
     * @param {function} scoreCalculatorMethod Defaults to null. A function member of the ScoreCalculator object can be
     * supplied here in lieu of a key and subkey if an aggregate range is needed instead of just 1 single field
     * @returns A object with keys for min, max, avg, and lowFreq
     */
    getRange: (team, key = "", subkey = "", scoreCalculatorMethod = null) => {
        let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0, medianArray = [], offset = 0;

        // Step 1: grab running averages, min and max for the scoring category across all matches in memory
        for (const match of team.data) {
            let score = scoreCalculatorMethod != null ? scoreCalculatorMethod(match) : match.performance[key][subkey];
            let negate = false;

            // Don't sum accuracy/fuel of this match if no cycles were scored
            if ((subkey == "accuracy" || subkey == "fuel") && match.performance[key].cycles <= 0) {
                offset += 1;
                continue;
            }

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
        }

        // Step 2: determine how many times the floor for the scoring category is reached
        for (const match of team.data) {
            let score = scoreCalculatorMethod != null ? scoreCalculatorMethod(match) : match.performance[key][subkey];
            if (score == min) lowFreq ++;
        }

        // Step 3: calculate the median
        medianArray.sort((a, b) => a - b);
        let median = (medianArray.length % 2 != 0 ? 
            medianArray[Math.floor(medianArray.length / 2)] 
            : 
            (medianArray[medianArray.length / 2] + medianArray[medianArray.length / 2 - 1]) / 2
        );
        
        // Step 4: wrap up by generating the average
        const dividend = team.data.length - offset;
        avg = dividend <= 0 ? 0 : avg / dividend;
        if (key == "endgame" && subkey == "state") avg = Math.max(Math.min(4, avg), 0);

        return { min: min > max ? 0 : min, max, avg, median, lowFreq };
    },

    /**
     * Gets all the match information for a team's contribution. Accounts for breakdowns, penalties, etc. Also calculates
     * the ODDS that a team will play defense and with what STRENGTH, but does NOT actually use these at all.
     * @param {object} funcs A dictionary of universal functions for generating numbers
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

        const getBasicBiasedRandom = (range) => !useRandom ? range.avg : biasedRandom(range.min, range.max, range[biasMethod], config.defaultInfluence);

        // Get auto score
        result.auto.cycles = getBasicBiasedRandom(getRange(team, "auto", "cycles"));
        result.auto.fuel = getBasicBiasedRandom(getRange(team, "auto", "fuel"));
        result.auto.accuracy = getBasicBiasedRandom(getRange(team, "auto", "accuracy"));

        // Determine whether robot climbs
        const autoClimbs = team.data.map(match => match.performance.auto.state).reduce((a, b) => a + b, 0);
        result.auto.state = !useRandom ? (autoClimbs / team.data.length > .5) : rng() < (autoClimbs / team.data.length);

        // Get teleop score
        result.teleop.cycles = getBasicBiasedRandom(getRange(team, "teleop", "cycles"));
        result.teleop.fuel = getBasicBiasedRandom(getRange(team, "teleop", "fuel"));
        result.teleop.accuracy = getBasicBiasedRandom(getRange(team, "teleop", "accuracy"));

        // Get endgame score
        let ef = {};    // Endgame frequency, storing # of times each endgame occurred
        ef[EndgameResult.NONE] = 0;
        ef[EndgameResult.LEVEL_1] = 0;
        ef[EndgameResult.LEVEL_2] = 0;
        ef[EndgameResult.LEVEL_3] = 0;
        team.data.forEach(match => ef[match.performance.endgame.state] ++);

        if (useRandom) {
            let endgameRange = getRange(team, "endgame", "state", null);
            result.endgame.state = ScoreCalculator.Endgame.getLevelFromNumber(Math.round(biasedRandom(endgameRange.min, endgameRange.max, endgameRange["median"], 0)));
        } else {
            let mostCommonEndgame = EndgameResult.NONE;
            let occurrences = 0;
            Object.keys(ef).forEach(endgame => {
                if (ef[endgame] >= occurrences) {
                    mostCommonEndgame = endgame;
                    occurrences = ef[endgame];
                }
            });
            result.endgame.state = mostCommonEndgame;
        }

        // Get defense tendencies
        if (config.applyDefense) {
            let defensivePlays = 0, okDefensePlays = 0, strongDefensePlays = 0;
            team.data.forEach(match => {
                if (match.performance.defense.played) {
                    defensivePlays ++;
                    if (match.performance.defense.rating == "Strong") strongDefensePlays ++;
                    if (match.performance.defense.rating == "OK") okDefensePlays ++;
                }
            });
            result.defense.tendency = defensivePlays / team.data.length;    // new property- only invoked in cases where more than 1 team says yes to play defense
            result.defense.played = rng() < result.defense.tendency;        // TODO add option for this to not be random

            let rngValue = rng();
            result.defense.rating = "Weak";
            if (rngValue < (strongDefensePlays + okDefensePlays) / defensivePlays) result.defense.rating = "OK";
            if (rngValue < strongDefensePlays / defensivePlays) result.defense.rating = "Strong";
        }
        
        return result;
    },

    /**
     * Runs BEFORE the match is decided and BEFORE the `postSimulationCalculations`, but AFTER
     * the performance objects for a match are generated.
     * @param {*} teams Array of Team objects
     * @param {*} performances An array of performance objects, agnostic to color
     * @param {*} gameStats The `gameStats` property of the `AllianceDetails` class
     * @param {*} rng The seeded random generator
     */
    preCompilationCalculations: (teams, performances, gameStats, rng) => {},

    /**
     * An optional function that runs IMMEDIATELY after an alliance's scores are tabulated, i.e. after defense and
     * all other adjustments are accounted for, but BEFORE a winner is determined.
     * Created for the purpose of boosting scores (for example, power ups), executed inside the `getScores` method of `AllianceDetails`.
     * @param {AllianceDetails} allianceDetails The `AllianceDetails` object
     * @param {AllianceDetails} opposingAllianceDetails The other alliance's `AllianceDetails` object
     */
    adjustScoring: (allianceDetails, opposingAllianceDetails) => {
        // Round the teleop and auto scores
        allianceDetails.autoScore = Math.round(allianceDetails.autoScore);
        allianceDetails.teleopScore = Math.round(allianceDetails.teleopScore);
    },

    /**
     * Given the performance object of a defender, removes game pieces from their score, assuming that their defense
     * during the match reduces their capacity to score points.
     * @param {performanceObject} performance The `performanceObject` of the defender
     */
    deductDefenderScore: (performance) => {
        let pieces = ScoreCalculator.Teleop.getPieces({ performance });
        pieces = Math.ceil(pieces / 3);

        // TODO: Implement
    },

    /**
     * Reduces the scoring output of a team being targeted by a defender.
     * @param {performanceObject} performanceDefender The `performanceObject` of the defender
     * @param {performanceObject} performanceTarget The `performanceObject` of the offensive robot
     * @param {function} rng The random number generator
     */
    applyDefense: (performanceDefender, performanceTarget, rng) => {
        // TODO: Implement
        /*
        // Determine the quality of defense
        let basePieces = ScoreCalculator.Teleop.getPieces({ performance: performanceTarget });
        let pieces = basePieces;
        let reductionRate = 0.05;
        if (performanceDefender.defense.rating == "OK") reductionRate = 0.35;
        if (performanceDefender.defense.rating == "Strong") reductionRate = 0.65;
        reductionRate = Math.max(0, reductionRate + (rng() * 0.4 - 0.2));  // +/- 20% from base rate
        pieces = Math.round(pieces * reductionRate);
        performanceDefender.defense.prevented = pieces;

        // Reduce points
        while (pieces > 0) {
            const piece = Math.round(rng() * 5);
            switch (piece) {
                case Pieces.AlgaeLow:
                    performanceTarget.teleop.algaeLow --;
                    break;
                case Pieces.AlgaeHigh:
                    performanceTarget.teleop.algaeHigh --;
                    break;
                case Pieces.CoralL1:
                    performanceTarget.teleop.coralL1 --;
                    break;
                case Pieces.CoralL2:
                    performanceTarget.teleop.coralL2 --;
                    break;
                case Pieces.CoralL3:
                    performanceTarget.teleop.coralL3 --;
                    break;
                case Pieces.CoralL4:
                    performanceTarget.teleop.coralL4 --;
                    break;
            }
            pieces --;
        }*/
    },

    /**
     * An optional function that runs IMMEDIATELY before the winner of a match is determined in `MatchDetails`.
     * It should be used to adjust RPs or apply any game-specific mechanics.
     * @param {AllianceDetails} red The red alliance object
     * @param {AllianceDetails} blue The blue alliance object
     */
    runRPAdjustments: (red, blue) => {},

    /**
     * Runs during every match of the simulator to tabulate certain running averages and insights.
     * @param {string} color The alliance color
     * @param {object} results The results object in the simulator
     * @param {MatchDetails} matchDetails The `MatchDetails` object
     */
    postSimulationCalculations: (color, results, matchDetails) => {
        // Tally ranking points
        results[color].RPFreq[
            matchDetails[color].matchRP + 
            (matchDetails[color].gameStats.energizedRP ? 1 : 0) +
            (matchDetails[color].gameStats.superchargedRP ? 1 : 0) +
            (matchDetails[color].gameStats.traversalRP ? 1 : 0)
        ] ++;
        results[color].energizedRPRate += matchDetails[color].gameStats.energizedRP ? 1 : 0;
        results[color].superchargedRPRate += matchDetails[color].gameStats.superchargedRPRate ? 1 : 0;
        results[color].traversalRPRate += matchDetails[color].gameStats.traversalRPRate ? 1 : 0;
        
        // Tally game piece, scoring totals
        for (const p of matchDetails[color].teamPerformances) {
            results[color].averageCycles += ScoreCalculator.Auto.getPieces({ performance: p }) + ScoreCalculator.Teleop.getPieces({ performance: p });
            results[color].averageEndgame += ScoreCalculator.Endgame.getScore({ performance: p });
        }
        
        // Tally defensive performances
        let defensePieces = 0;
        matchDetails[color].teamPerformances.forEach( p => defensePieces += (p.defense.prevented ?? 0) );
        results[color].defenseOccurrences += defensePieces > 0;
        results[color].defensePiecesPrevented += defensePieces;

        // Insights that are independent of what the opposing alliance did
        if (matchDetails[color].autoScore > results[color].insights.autoAboveThreshold.threshold) {
            results[color].insights.autoAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.autoAboveThreshold.wins ++;
        }
        if (matchDetails[color].endgameScore > results[color].insights.endgameAboveThreshold.threshold) {
            results[color].insights.endgameAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.endgameAboveThreshold.wins ++;
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
        const calculateAverages = (color) => {
            results[color].energizedRPRate /= config.simulations;
            results[color].superchargedRPRate /= config.simulations;
            results[color].traversalRPRate /= config.simulations;
            results[color].averageCycles /= config.simulations;
            results[color].averageEndgame /= config.simulations;
            results[color].defensePiecesPrevented /= results[color].defenseOccurrences;
        }
        calculateAverages('red');
        calculateAverages('blue');
    }
}

export default SimulationInformation;