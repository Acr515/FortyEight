import ScoreCalculator from "data/game_specific/ScoreCalculator/2025";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2025";
import gameDataObject from "util/gameData/2025";

const Pieces = {
    AlgaeLow: 0,
    AlgaeHigh: 1,
    CoralL1: 2,
    CoralL2: 3,
    CoralL3: 4,
    CoralL4: 5,
};

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        autoRPRate: 0,
        coralRPRate: 0,
        bargeRPRate: 0,
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
        coopertitionPossible: false,    // whether or not the alliance scored 2 algae in their processor
        canForceCoopertition: false,    // whether or not the alliance could reasonably score enough algae to score into the opposing processor
        coralRowsTowardsRP: 0,          // total reef rows that have met the threshold towards earning the coral RP
        autoRP: false,                  // RP for all robots leaving + 1 scored coral
        coralRP: false,                 // RP for 5 coral on each level (OR 3 levels if coopertition is active)
        bargeRP: false                  // RP for total endgame points scored (at least 14)
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        let autoLeaves = 0, autoCoral = 0;
        let totalCoral = [0, 0, 0, 0];
        let totalProcessorAlgae = 0;
        let totalBarge = 0;
        for (const team of teamPerformances) {
            // Auto RP qualification
            autoLeaves += team.auto.leave;
            autoCoral += ScoreCalculator.Auto.getCoral({ performance: team });

            // Coopertition 
            totalProcessorAlgae += team.auto.algaeLow + team.teleop.algaeLow;

            // Coral RP qualification
            totalCoral[0] += team.auto.coralL1 + team.teleop.coralL1;
            totalCoral[1] += team.auto.coralL2 + team.teleop.coralL2;
            totalCoral[2] += team.auto.coralL3 + team.teleop.coralL3;
            totalCoral[3] += team.auto.coralL4 + team.teleop.coralL4;

            // Barge RP qualification
            totalBarge += ScoreCalculator.Endgame.getScore({ performance: team });
        }
        const thresholdLevelCount = totalCoral.map(val => val >= gameDataObject.config.coralRPThreshold ? 1 : 0).reduce((a, b) => a + b, 0);
        gameStats.autoRP = autoLeaves >= 3 && autoCoral > 0;
        gameStats.bargeRP = totalBarge >= gameDataObject.config.bargeRPThreshold;
        gameStats.coopertitionPossible = totalProcessorAlgae >= 2;
        gameStats.canForceCoopertition = totalProcessorAlgae >= 5;
        gameStats.coralRowsTowardsRP = thresholdLevelCount; 
        gameStats.coralRP = thresholdLevelCount >= 4; 
    },

    /**
     * If a game ends in a tie, this method can determine which alliance would win the tie.
     * @param {*} red Red alliance team data
     * @param {*} blue Blue alliance team data
     * @returns The alliance team data object that won the tiebreakers; if a dead-even tie, returns `{ color: "Tie" }`
     */
    getTiebreakWinner: (red, blue) => {
        if (red.autoScore != blue.autoScore) return red.autoScore > blue.autoScore ? red : blue;
        if (red.endgameScore != blue.endgameScore) return red.endgameScore > blue.endgameScore ? red : blue;
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
        avg = avg / (team.data.length - offset);
        if (key == "endgame" && subkey == "state") avg = Math.max(Math.min(4, avg), 0);

        return { min, max, avg, median, lowFreq };
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

        // Get auto score
        // Calculate total coral/algae scored in auto- locations are determined next
        let autoPieceRange = getRange(team, "", "", ScoreCalculator.Auto.getPieces);
        let autoPiecesScored = Math.round(!useRandom ? autoPieceRange.avg : biasedRandom(autoPieceRange.min, autoPieceRange.max, autoPieceRange[biasMethod], config.defaultInfluence));
        if (autoPiecesScored > 1) result.auto.leave = true; // surely must have left line to get another game piece

        // Determine whether robot leaves if it wasn't implied already
        if (!result.auto.leave) {
            const leaves = team.data.map(match => match.performance.auto.leave).reduce((a, b) => a + b, 0);
            result.auto.leave = !useRandom ? (leaves / team.data.length > .5) : rng() < (leaves / team.data.length);
        }

        // Get auto scoring piece/location favorability
        if (autoPiecesScored > 0) {
            const scoringHistory = [];
            for (const match of team.data) {
                scoringHistory.push(...new Array(match.performance.auto.algaeLow).fill(Pieces.AlgaeLow));
                scoringHistory.push(...new Array(match.performance.auto.algaeHigh).fill(Pieces.AlgaeHigh));
                scoringHistory.push(...new Array(match.performance.auto.coralL1).fill(Pieces.CoralL1));
                scoringHistory.push(...new Array(match.performance.auto.coralL2).fill(Pieces.CoralL2));
                scoringHistory.push(...new Array(match.performance.auto.coralL3).fill(Pieces.CoralL3));
                scoringHistory.push(...new Array(match.performance.auto.coralL4).fill(Pieces.CoralL4));
            }

            // Allocate to random locations based on favorability
            for (let i = 0; i < autoPiecesScored; i ++) {
                const drawnIndex = Math.round(rng() * scoringHistory.length);
                const drawnElement = scoringHistory.splice(drawnIndex, 1)[0];
                switch (drawnElement) {
                    case Pieces.AlgaeLow: result.auto.algaeLow += 1; break;
                    case Pieces.AlgaeHigh: result.auto.algaeHigh += 1; break;
                    case Pieces.CoralL1: result.auto.coralL1 += 1; break;
                    case Pieces.CoralL2: result.auto.coralL2 += 1; break;
                    case Pieces.CoralL3: result.auto.coralL3 += 1; break;
                    case Pieces.CoralL4: result.auto.coralL4 += 1; break;
                }
            }
        }

        // Get teleop score
        // Calculate total coral/algae scored in teleop- locations are determined next
        let teleopPieceRange = getRange(team, "", "", ScoreCalculator.Teleop.getPieces);
        let teleopPiecesScored = Math.round(!useRandom ? teleopPieceRange.avg : biasedRandom(teleopPieceRange.min, teleopPieceRange.max, teleopPieceRange[biasMethod], config.defaultInfluence));

        // Get scoring piece/location favorability
        if (teleopPiecesScored > 0) {
            const scoringHistory = [];
            for (const match of team.data) {
                scoringHistory.push(...new Array(match.performance.teleop.algaeLow).fill(Pieces.AlgaeLow));
                scoringHistory.push(...new Array(match.performance.teleop.algaeHigh).fill(Pieces.AlgaeHigh));
                scoringHistory.push(...new Array(match.performance.teleop.coralL1).fill(Pieces.CoralL1));
                scoringHistory.push(...new Array(match.performance.teleop.coralL2).fill(Pieces.CoralL2));
                scoringHistory.push(...new Array(match.performance.teleop.coralL3).fill(Pieces.CoralL3));
                scoringHistory.push(...new Array(match.performance.teleop.coralL4).fill(Pieces.CoralL4));
            }

            // Allocate to random locations based on favorability
            for (let i = 0; i < teleopPiecesScored; i ++) {
                const drawnIndex = Math.round(rng() * scoringHistory.length);
                const drawnElement = scoringHistory.splice(drawnIndex, 1)[0];
                switch (drawnElement) {
                    case Pieces.AlgaeLow: result.teleop.algaeLow += 1; break;
                    case Pieces.AlgaeHigh: result.teleop.algaeHigh += 1; break;
                    case Pieces.CoralL1: result.teleop.coralL1 += 1; break;
                    case Pieces.CoralL2: result.teleop.coralL2 += 1; break;
                    case Pieces.CoralL3: result.teleop.coralL3 += 1; break;
                    case Pieces.CoralL4: result.teleop.coralL4 += 1; break;
                }
            }
        }

        // Get endgame score
        let ef = {};    // Endgame frequency, storing # of times each endgame occurred
        ef[EndgameResult.NONE] = 0;
        ef[EndgameResult.PARK] = 0;
        ef[EndgameResult.SHALLOW_CAGE] = 0;
        ef[EndgameResult.DEEP_CAGE] = 0;
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
    preCompilationCalculations: (teams, performances, gameStats, rng) => {
        // Move coral if levels 2-4 of the reef are full
        // First, count coral
        const totalReefScored = [0, 0, 0];   // levels 2-4
        const autoReefScored = [0, 0, 0];   // levels 2-4
        for (const p of performances) {
            totalReefScored[0] += p.auto.coralL2 + p.teleop.coralL2;
            totalReefScored[1] += p.auto.coralL3 + p.teleop.coralL3;
            totalReefScored[2] += p.auto.coralL4 + p.teleop.coralL4;

            autoReefScored[0] += p.auto.coralL2;
            autoReefScored[1] += p.auto.coralL3;
            autoReefScored[2] += p.auto.coralL4;
        }

        /**
         * Determines whether a team is capable of scoring on a given level.
         * @param {*} teamIndex The index from within the performances/teams arrays to check
         * @param {*} level The level of the reef to check
         * @returns True if team has any history of scoring on a particular level; false otherwise
         */
        const canScoreAtLevel = (teamIndex, level) => {
            for (const match of teams[teamIndex].data) {
                let key = `coralL${level}`;
                if (match.performance.auto[key] > 0 || match.performance.teleop[key] > 0) { return true; }
            }
            return false;
        }

        /**
         * Once coral is removed from a phase, this function attempts to move it somewhere else.
         * @param {*} teamIndex The index from within the performances/teams arrays to check
         * @param {*} level The level from which coral was removed
         */
        const reassignCoral = (teamIndex, level) => {
            const otherLevels = [2, 1, 0].filter(val => val !== level);
            const levelKeys = ['coralL2', 'coralL3', 'coralL4'];
            const p = performances[teamIndex];
            for (const checkingLevel of otherLevels) {
                if (totalReefScored[checkingLevel] < 12 && canScoreAtLevel(teamIndex, checkingLevel + 2)) {
                    // Reassign coral to checked level because team can score there
                    p.teleop[levelKeys[checkingLevel]] ++;
                    totalReefScored[checkingLevel] ++;
                    return;
                }
            }
            // Nowhere else was eligible; attempt to score in trough
            if (canScoreAtLevel(teamIndex, 1)) {
                p.teleop.coralL1 ++;
            }
        }

        const checkCoralLevel = (coralIndex, coralKey) => {
            while (totalReefScored[coralIndex] > 12) {    // each level can fit 12 coral
                if (autoReefScored[coralIndex] === totalReefScored[coralIndex]) {
                    // Need to reduce auton production because the row became full during auto (nice job)
                    for (let index = 0; index < 3; index ++) {
                        const p = performances[index];
                        if (totalReefScored[coralIndex] > 12 && p.auto[coralKey] > 0) {
                            totalReefScored[coralIndex] --;
                            autoReefScored[coralIndex] --;
                            p.auto[coralKey] --;
                        }
                    }
                }
                // Reduce teleop performances
                for (let index = 0; index < 3; index ++) {
                    const p = performances[index];
                    if (totalReefScored[coralIndex] > 12 && p.teleop[coralKey] > 0) {
                        // Attempt to move coral to a lower level
                        totalReefScored[coralIndex] --;
                        p.teleop[coralKey] --;
                        reassignCoral(index, coralIndex);
                    }
                }
            }
        }

        // Reallocate in waterfall fashion, beginning with level 4
        checkCoralLevel(2, 'coralL4');
        checkCoralLevel(1, 'coralL3');
        checkCoralLevel(0, 'coralL2');
    },

    /**
     * An optional function that runs IMMEDIATELY after an alliance's scores are tabulated, i.e. after defense and
     * all other adjustments are accounted for, but BEFORE a winner is determined.
     * Created for the purpose of boosting scores (for example, power ups), executed inside the `getScores` method of `AllianceDetails`.
     * @param {AllianceDetails} allianceDetails The `AllianceDetails` object
     * @param {AllianceDetails} opposingAllianceDetails The other alliance's `AllianceDetails` object
     */
    adjustScoring: (allianceDetails, opposingAllianceDetails) => {
        // Score every processed algae into opposing team's net
        let processedAlgae = 0;
        for (const p of opposingAllianceDetails.teamPerformances) {
            processedAlgae += p.auto.algaeLow + p.teleop.algaeHigh;
        }
        allianceDetails.teleopScore += processedAlgae * 4;
    },

    /**
     * Given the performance object of a defender, removes game pieces from their score, assuming that their defense
     * during the match reduces their capacity to score points.
     * @param {performanceObject} performance The `performanceObject` of the defender
     */
    deductDefenderScore: (performance) => {
        let pieces = ScoreCalculator.Teleop.getPieces({ performance });
        pieces = Math.ceil(pieces / 3);

        while (pieces > 0) {
            if (performance.teleop.algaeHigh > 0) {
                performance.teleop.algaeHigh --;
                pieces --;
            }
            if (pieces > 0 && performance.teleop.algaeLow > 0) {
                performance.teleop.algaeLow --;
                pieces --;
            }
            if (pieces > 0 && performance.teleop.coralL4 > 0) {
                performance.teleop.coralL4 --;
                pieces --;
            }
            if (pieces > 0 && performance.teleop.coralL3 > 0) {
                performance.teleop.coralL3 --;
                pieces --;
            }
            if (pieces > 0 && performance.teleop.coralL2 > 0) {
                performance.teleop.coralL2 --;
                pieces --;
            }
            if (pieces > 0 && performance.teleop.coralL1 > 0) {
                performance.teleop.coralL1 --;
                pieces --;
            }
        }
    },

    /**
     * Reduces the scoring output of a team being targeted by a defender.
     * @param {performanceObject} performanceDefender The `performanceObject` of the defender
     * @param {performanceObject} performanceTarget The `performanceObject` of the offensive robot
     * @param {function} rng The random number generator
     */
    applyDefense: (performanceDefender, performanceTarget, rng) => {
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
        }
    },

    /**
     * An optional function that runs IMMEDIATELY before the winner of a match is determined in `MatchDetails`.
     * It should be used to adjust RPs or apply any game-specific mechanics.
     * @param {AllianceDetails} red The red alliance object
     * @param {AllianceDetails} blue The blue alliance object
     */
    runRPAdjustments: (red, blue) => {
        // Determine co-opertition bonus
        if (red.gameStats.coopertitionPossible && blue.gameStats.coopertitionPossible) {
            // We have co-opertition! Threshold is now only 3 completed levels for reef RP
            if (red.gameStats.coralRowsTowardsRP >= 3) red.gameStats.coralRP = true;
            if (blue.gameStats.coralRowsTowardsRP >= 3) blue.gameStats.coralRP = true;
        }
    },

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
            (matchDetails[color].gameStats.autoRP ? 1 : 0) +
            (matchDetails[color].gameStats.coralRP ? 1 : 0) +
            (matchDetails[color].gameStats.bargeRP ? 1 : 0)
        ] ++;
        results[color].autoRPRate += matchDetails[color].gameStats.autoRP ? 1 : 0;
        results[color].coralRPRate += matchDetails[color].gameStats.coralRP ? 1 : 0;
        results[color].bargeRPRate += matchDetails[color].gameStats.bargeRP ? 1 : 0;
        
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
            results[color].autoRPRate /= config.simulations;
            results[color].coralRPRate /= config.simulations;
            results[color].bargeRPRate /= config.simulations;
            results[color].averageCycles /= config.simulations;
            results[color].averageEndgame /= config.simulations;
            results[color].defensePiecesPrevented /= results[color].defenseOccurrences;
        }
        calculateAverages('red');
        calculateAverages('blue');
    }
}

export default SimulationInformation;