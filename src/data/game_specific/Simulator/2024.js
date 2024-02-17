import ScoreCalculator from "data/game_specific/ScoreCalculator/2024";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2024";

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        melodyRPRate: 0,
        ensembleRPRate: 0,
        averageNotes: 0,
        speakerNoteRate: 0,
    },

    /**
     * Injected into the simulator alliance objects under the key `insights` and is used accordingly in the Insights section
     */
    allianceInsights: {
        autoAboveThreshold: { threshold: 14, count: 0, wins: 0, string: "autonomous" },
        endgameAboveThreshold: { threshold: 10, count: 0, wins: 0, string: "endgame" },
        outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
        outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
    },

    /**
     * A function that gets game-specific variables for a single match, typically for ranking point related tracking.
     * Injected into the `AllianceDetails` class.
     * @returns An object with properties `melodyRP` and `ensembleRP` along with other key properties related to RPs
     */
    singleMatchAllianceDetails: {
        coopertitionPossible: false,    // whether or not the alliance scores quickly enough to use the co-opertition button
        notesTowardsMelody: 0,          // total notes scored during the match for eligibility for the melody RP
        amplifiedNotes: 0,              // total notes scored in the speaker that could be amplified using amp notes
        melodyRP: false,                // RP for total game pieces scored
        ensembleRP: false               // RP for total endgame points scored
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        // Melody RP qualification (enough game pieces scored)
        // Simultaneously, check if it would be reasonably possible for the coopertition threshold to be met
        let totalAutoNotes = 0, totalTeleopNotes = 0, totalAutoAmpNotes = 0, totalTeleopAmpNotes = 0;
        teamPerformances.forEach(team => {
            totalAutoNotes += ScoreCalculator.Auto.getPieces({ performance: team });
            totalTeleopNotes += ScoreCalculator.Teleop.getPieces({ performance: team });
            totalAutoAmpNotes += team.auto.amp;
            totalTeleopAmpNotes += team.teleop.amp;
        });
        gameStats.notesTowardsMelody = totalAutoNotes + totalTeleopNotes;           // for melody qualification
        gameStats.melodyRP = totalAutoNotes + totalTeleopNotes >= 18;               // we can't know yet if coopertition bonus is active, but this would guarantee an RP anyway, threshold is 18
        
        if (totalAutoAmpNotes > 0) gameStats.coopertitionPossible = true; else {    // any amp score automatically qualifies
            let scoringRate = totalTeleopAmpNotes / 120;                            // minus endgame and auto, game last 120 seconds
            if (scoringRate * 45 >= 1) gameStats.coopertitionPossible = true;       // alliance scored fast enough, making it possible to score in the first 45 seconds of teleop
        }

        // Ensemble RP qualification (endgame climbing points)
        let totalEndgameScore = 0;
        teamPerformances.forEach(team => totalEndgameScore += ScoreCalculator.Endgame.getScore({ performance: team }));
        gameStats.ensembleRP = totalEndgameScore >= 10; // TODO: RNG a random chance that a team is spotlit?
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
     * occurrances of the lowest value.
     * @param {Team} team The team object
     * @param {string} key The part of the game (i.e. auto, teleop)
     * @param {string} subkey The scoring category (i.e. cargoLow)
     * @param {function} scoreCalculatorMethod Defaults to -1. A function member of the ScoreCalculator object can be
     * supplied here in lieu of a key and subkey if an aggregate range is needed instead of just 1 single field
     * @returns A object with keys for min, max, avg, and lowFreq
     */
    getRange: (team, key = "", subkey = "", scoreCalculatorMethod = -1) => {
        let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0, medianArray = [], offset = 0;

        // Step 1: grab running averages, min and max for the scoring category across all matches in memory
        team.data.forEach(match => {
            let score = scoreCalculatorMethod != -1 ? scoreCalculatorMethod(match) : match.performance[key][subkey];
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

        // Step 2: determine how many times the floor for the scoring category is reached
        team.data.forEach(match => {
            let score = scoreCalculatorMethod != -1 ? scoreCalculatorMethod(match) : match.performance[key][subkey];
            if (score == min) lowFreq ++;
        });

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
        // Determine whether robot leaves (autocross)
        let leaves = 0;
        team.data.forEach(match => leaves += match.performance.auto.leave);
        result.auto.leave = !useRandom ? (leaves / team.data.length > .5) : rng() < (leaves / team.data.length);
        
        // Calculate total notes scored in auto- locations are determined next
        let autoPieceRange = getRange(team, "", "", ScoreCalculator.Auto.getPieces);
        let autoPiecesScored = Math.round(!useRandom ? autoPieceRange.avg : biasedRandom(autoPieceRange.min, autoPieceRange.max, autoPieceRange[biasMethod], config.defaultInfluence));
        if (autoPiecesScored > 1) result.auto.leave = true; // must have left line to get an additional note

        // Get scoring location favorability
        let autoAmpNotes = 0, autoSpeakerNotes = 0;
        team.data.forEach(match => {
            autoAmpNotes += match.performance.auto.amp;
            autoSpeakerNotes += match.performance.auto.speaker;
        });

        // Allocate notes to random locations based on favorability
        let autoSpeakerRate = autoSpeakerNotes / (autoSpeakerNotes + autoAmpNotes);
        for (let i = 0; i < autoPiecesScored; i ++) {
            if (rng() < autoSpeakerRate) result.auto.speaker ++; else result.auto.amp ++;
        }


        // Get teleop score
        // Calculate total notes scored in teleop- locations are determined next
        let teleopPieceRange = getRange(team, "", "", ScoreCalculator.Teleop.getPieces);
        let teleopPiecesScored = Math.round(!useRandom ? teleopPieceRange.avg : biasedRandom(teleopPieceRange.min, teleopPieceRange.max, teleopPieceRange[biasMethod], config.defaultInfluence));

        // Get scoring location favorability
        let teleopAmpNotes = 0, teleopSpeakerNotes = 0;
        team.data.forEach(match => {
            teleopAmpNotes += match.performance.teleop.amp;
            teleopSpeakerNotes += match.performance.teleop.speaker;
        });

        // Allocate notes to random locations based on favorability
        let teleopSpeakerRate = teleopSpeakerNotes / (teleopSpeakerNotes + teleopAmpNotes);
        for (let i = 0; i < teleopPiecesScored; i ++) {
            if (rng() < teleopSpeakerRate) result.teleop.speaker ++; else result.teleop.amp ++;
        }
        

        // Get endgame score
        let ef = {};    // Endgame frequency, storing # of times each endgame occurred
        ef[EndgameResult.NONE] = 0;
        ef[EndgameResult.PARKED] = 0;
        ef[EndgameResult.ONSTAGE] = 0;
        ef[EndgameResult.HARMONIZED] = 0;
        team.data.forEach(match => ef[match.performance.endgame.state] ++);
        result.endgame.harmonyRate = ef[EndgameResult.HARMONIZED] / (ef[EndgameResult.HARMONIZED] + ef[EndgameResult.ONSTAGE]); // new property- invoked in preCompilationCalculations when only 1 team registers as harmonized

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
        // Get trap scoring
        if (result.endgame.state != EndgameResult.NONE) {
            // Including the parked state in this because there's always a MINOR chance that the robot scores in the trap but fails to meet requirements for being on-stage
            let trapScores = 0, trapOpportunities = 0;
            team.data.forEach(match => {
                trapScores += match.performance.endgame.trap;
                trapOpportunities += ScoreCalculator.Endgame.getNumericalLevel(match) > 1;
            });
            result.endgame.trap = !useRandom ? (trapScores / team.data.length > .5) : rng() < (trapScores / trapOpportunities);
            if (result.endgame.trap && result.endgame.state == EndgameResult.PARKED && rng() > 0.1) result.endgame.trap = false;   // giving a 10% to keep trap score outcome if parked
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
     * @param {*} color The alliance color (unused)
     * @param {*} performances An array of performance objects, agnostic to color
     * @param {*} gameStats The `gameStats` property of the `AllianceDetails` class
     * @param {*} rng The seeded random generator
     */
    preCompilationCalculations: (color, performances, gameStats, rng) => {
        // Resolve harmonization
        let harmonizedTeams = 0, harmonyIndex = -1;
        performances.forEach((p, ind) => {
            harmonizedTeams += p.endgame.state == EndgameResult.HARMONIZED;
            harmonyIndex = ind;     // this attribute only matters when 1 robot is harmonized, see below
        });
        if (harmonizedTeams == 3) {
            // Randomly de-elevate one team; we assume that three teams cannot harmonize on the same chain
        } else if (harmonizedTeams == 1) {
            // Using the result.endgame.harmonyRate values of other teams, determine whether to elevate another robot or to de-elevate the harmonized robot
            // Start by isolating teams down to the one that has the best chance of being elevated to harmonized
            let otherIndeces = [0, 1, 2];
            otherIndeces.splice(otherIndeces.indexOf(harmonyIndex), 1);
            let bestCandidate = performances[otherIndeces[0]].endgame.harmonyRate > performances[otherIndeces[1]].endgame.harmonyRate ? performances[otherIndeces[0]] : performances[otherIndeces[1]];
            
            // If their harmony rate beats RNG, elevate them- otherwise, de-elevate other robot
            if (rng() < bestCandidate.endgame.harmonyRate) bestCandidate.endgame.state = EndgameResult.HARMONIZED; else performances[harmonyIndex].endgame.state = EndgameResult.ONSTAGE;
        }

        // Simulate amplification bonuses
        // For every TWO notes scored in the AMP, provide amplification of 1-4 SPEAKER notes, dependent on the rate of speaker scoring
        // Count # of possible amplifications during the course of the game and the number of possible amplified speaker scores
        let teleopAmpNotes = 0, speakerNotes = 0, maxAmplifications = 0;
        const AMPLIFY_PERIOD = 120, AMPLIFY_COOLDOWN = 15; // assuming that amplification would only possibly happen during teleop and not during last 15 seconds, also assuming 15 seconds between amplifications
        performances.forEach(p => {
            teleopAmpNotes += p.teleop.amp;
            speakerNotes += p.teleop.speaker;
        });

        maxAmplifications = Math.min(teleopAmpNotes / 2, AMPLIFY_PERIOD / AMPLIFY_COOLDOWN);  // there is a ceiling to the # of amplifications in a match
        if (maxAmplifications > 1) maxAmplifications = Math.max(2, maxAmplifications - Math.round(rng()));          // randomly remove an amplification
        let speakerRate = speakerNotes / AMPLIFY_PERIOD;                                                            // # of notes in speaker per second
        gameStats.amplifiedNotes = Math.min(maxAmplifications * 4, Math.ceil(10 * maxAmplifications * speakerRate));// 10 seconds of amplification * # of amplifications * speaker notes per second = # of amplified notes
    },

    /**
     * An optional function that runs IMMEDIATELY after an alliance's scores are tabulated, i.e. after defense and
     * all other adjustments are accounted for, but BEFORE a winner is determined.
     * Created for the purpose of boosting scores (for example, power ups), executed inside the `getScores` method of `AllianceDetails`.
     * @param {AllianceDetails} allianceDetails The `AllianceDetails` object
     */
    adjustScoring: (allianceDetails) => {
        allianceDetails.teleopScore += allianceDetails.gameStats.amplifiedNotes * 3;    // bonus for amplified notes is +3 on top of the 2 points received already
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
            // We have co-opertition! Threshold is now only 15 for melody RP
            if (red.gameStats.notesTowardsMelody >= 15) red.gameStats.melodyRP = true;
            if (blue.gameStats.notesTowardsMelody >= 15) blue.gameStats.melodyRP = true;
        }
    },

    /**
     * Runs during every match of the simulator to tabulate certain running averages and insights.
     * @param {string} color The alliance color
     * @param {object} results The results object in the simulator
     * @param {MatchDetails} matchDetails The `MatchDetails` object
     */
    postSimulationCalculations: (color, results, matchDetails) => {
        // Game-specific running averages/rates
        results[color].RPFreq[matchDetails[color].matchRP + (matchDetails[color].gameStats.melodyRP ? 1 : 0) + (matchDetails[color].gameStats.ensembleRP ? 1 : 0)] ++;
        results[color].melodyRPRate += matchDetails[color].gameStats.melodyRP ? 1 : 0;
        results[color].ensembleRPRate += matchDetails[color].gameStats.ensembleRP ? 1 : 0;
        
        matchDetails[color].teamPerformances.forEach( p => results[color].averageNotes += ScoreCalculator.Auto.getPieces({ performance: p }) + ScoreCalculator.Teleop.getPieces({ performance: p }) );
        matchDetails[color].teamPerformances.forEach( p => results[color].speakerNoteRate += p.auto.speaker + p.teleop.speaker );

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
        results.red.melodyRPRate /= config.simulations;
        results.red.ensembleRPRate /= config.simulations;
        results.red.speakerNoteRate /= results.red.averageNotes;
        results.red.averageNotes /= config.simulations;
        
        results.blue.melodyRPRate /= config.simulations;
        results.blue.ensembleRPRate /= config.simulations;
        results.blue.speakerNoteRate /= results.blue.averageNotes;
        results.blue.averageNotes /= config.simulations;
    }
}

export default SimulationInformation;