import ScoreCalculator from "data/game_specific/ScoreCalculator/2023";
import performanceObject, { EndgameResult } from "data/game_specific/performanceObject/2023";

const SimulationInformation = {
    /**
     * Relevant alliance data injected into the root of the simulator alliance object
     */
    baseAllianceData: {
        gridRPRate: 0,
        climbRPRate: 0,
        endgameCeiling: 0,
        autoCeiling: 0,
        gridContributions: -1
    },

    /**
     * Injected into the simulator alliance objects under the key `insights` and is used accordingly in the Insights section
     */
    allianceInsights: {
        endgameAboveThreshold: { threshold: 20, count: 0, wins: 0, string: "endgame" },
        chargeStationAboveThreshold: { threshold: 28, count: 0, wins: 0, string: "charge station" },
        endgameBelowThreshold: { threshold: 10, count: 0, wins: 0, string: "endgame" },
        autoAboveThreshold: { threshold: 18, count: 0, wins: 0, string: "autonomous" },
        outscoredEndgame: { count: 0, wins: 0, string: "endgame" },
        outscoredTeleop: { count: 0, wins: 0, string: "teleop" },
        outscoredAuto: { count: 0, wins: 0, string: "autonomous" },
    },

    /**
     * A function that gets game-specific variables for a single match, typically for ranking point related tracking.
     * Injected into the `AllianceDetails` class.
     * @returns An object with properties `gridRP`, `climbRP`, `links`, and `chargeScore`
     */
    singleMatchAllianceDetails: {
        links: 0,
        chargeScore: 0,
        gridRP: false,
        climbRP: false
    },

    /**
     * Injected into the `AllianceDetails` class. Used to generate boolean flags for which ranking points a team received.
     * @param {*} teamPerformances The `teamPerformances` object stored in `AllianceDetails`
     * @param {*} gameStats The `gameStats` member of the `AllianceDetails` class is assigned to `singleMatchAllianceDetails`, which must be received by this method here so that it can modify the data
     */
    getRPs: (teamPerformances, gameStats) => {
        // Check for grid RP
        gameStats.gridRP = gameStats.links >= 5;

        // Check for climb RP
        let climbScore = 0;
        teamPerformances.forEach(team => climbScore += ScoreCalculator.Auto.getChargeStationScore({ performance: team }) + ScoreCalculator.Endgame.getChargeStationScore({ performance: team }));
        gameStats.climbRP = climbScore >= 26;
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
     * @param {function} scoreCalculatorMethod Defaults to null. Since most of the scoring categories this year are all
     * over the place, give an input function to be used here instead of singular keys in the performance object
     * @returns A object with keys for min, max, avg, and lowFreq
     */
    getRange: (team, key = "", subkey = "", scoreCalculatorMethod = -1) => {
        let min = Number.MAX_VALUE, max = 0, avg = 0, lowFreq = 0, medianArray = [], offset = 0;

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

        team.data.forEach(match => {
            let score = scoreCalculatorMethod != -1 ? scoreCalculatorMethod(match) : match.performance[key][subkey];
            if (score == min) lowFreq ++;
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

        /*
            New strategy: use the range of total game pieces scored for RNG, then using a team's scoring location ratio, determine where the pieces will be scored using RNG.
            Do this separately in teleop for cones and cubes
        */
        // First, determine if this team is capable of scoring on grid/mobility and docking at the same time
        let gridAndChargeCapable = false, mobilityAndChargeCapable = false;
        team.data.forEach(match => {
            if (match.performance.auto.docked && ScoreCalculator.Auto.getPieces(match) > 0) gridAndChargeCapable = true;
            if (match.performance.auto.docked && match.performance.auto.mobility) mobilityAndChargeCapable = true;
        });

        // Then, get autonomous piece scoring range
        let autoPieceRange = getRange(team, "", "", ScoreCalculator.Auto.getPieces);
        let autoPiecesScored = Math.round(!useRandom ? autoPieceRange.avg : biasedRandom(autoPieceRange.min, autoPieceRange.max, autoPieceRange[biasMethod], config.defaultInfluence));

        // Determine whether or not this robot will dock and/or engage the charge station
        let autoDocked = false, autoEngaged = false;
        let af = {};    // Auto state frequency, storing # of times each charge station state occurred
        af[EndgameResult.NONE] = 0;
        af[EndgameResult.DOCKED] = 0;
        af[EndgameResult.DOCKED_AND_ENGAGED] = 0;
        team.data.forEach(match => af[match.performance.endgame.state] ++);
        if (useRandom) {
            let autoDockRange = getRange(team, "auto", "docked");
            let autoEngageRange = getRange(team, "auto", "engaged");
            autoDocked = biasedRandom(autoDockRange.min, autoDockRange.max, autoDockRange[biasMethod], config.defaultInfluence) >= .5;
            autoEngaged = autoDocked && biasedRandom(autoEngageRange.min, autoEngageRange.max, autoEngageRange[biasMethod], config.defaultInfluence) >= .5;
        } else {
            let dockRate = 0, engageRate = 0;
            team.data.forEach(match => {
                dockRate += match.performance.auto.docked;
                engageRate += match.performance.auto.engaged;
            })
            autoDocked = dockRate >= .5;
            autoEngaged = result.auto.docked && engageRate >= .5;
        }

        // Determine whether robot gets mobility
        let mobilities = 0;
        team.data.forEach(match => mobilities += match.performance.auto.mobility);
        result.auto.mobility = !useRandom ? (mobilities / team.data.length > .5) : rng() < (mobilities / team.data.length);

        // Now that mobility and docking were independently determined, disable conflicting attributes as needed
        if (!gridAndChargeCapable && autoPiecesScored > 0 && autoDocked) {
            // Must either not dock or not score game pieces; prefer docking
            if (rng() < .7) {
                autoPiecesScored = 0;
            } else {
                autoDocked = false;
                autoEngaged = false;
            }
        }
        if (!mobilityAndChargeCapable && autoDocked) {
            // Always prefer docking, so disable mobility
            result.auto.mobility = false;
        }
        result.auto.docked = autoDocked;
        result.auto.engaged = autoEngaged;

        // Finally, generate scoring positions for auto, if scoring occurs
        if (autoPiecesScored > 0) {
            let scoringLocations = [0, 0, 0, 0, 0, 0];  // Cones low, mid, high, cubes low, mid, high
            team.data.forEach(match => {
                scoringLocations[0] += match.performance.auto.coneLow;
                scoringLocations[1] += match.performance.auto.coneMid;
                scoringLocations[2] += match.performance.auto.coneHigh;
                scoringLocations[3] += match.performance.auto.cubeLow;
                scoringLocations[4] += match.performance.auto.cubeMid;
                scoringLocations[5] += match.performance.auto.cubeHigh;
            });
            let totalAverage = 0;
            scoringLocations = scoringLocations.map(val => {
                let avg = val / team.data.length;
                totalAverage += avg;
                return avg;
            });

            let determination = rng() * totalAverage, sum = 0, location = -1;
            scoringLocations.forEach((l, ind) => {
                sum += l;
                if (determination < sum && location == -1) {
                    // This will be the scoring location
                    location = ind;
                }
            });

            // Finally, allocate the result to a bucket
            switch (location) {
                case 0: result.auto.coneLow = autoPiecesScored; break;
                case 1: result.auto.coneMid = autoPiecesScored; break;
                case 2: result.auto.coneHigh = autoPiecesScored; break;
                case 3: result.auto.cubeLow = autoPiecesScored; break;
                case 4: result.auto.cubeMid = autoPiecesScored; break;
                case 5: result.auto.cubeHigh = autoPiecesScored; break;
            }
        }

        // Onward to teleop; get scoring range for cones and cubes
        /*let coneRange = getRange(team, "", "", ScoreCalculator.Teleop.getCones);
        let conesScored = Math.round(!useRandom ? coneRange.avg : biasedRandom(coneRange.min, coneRange.max, coneRange[biasMethod], config.defaultInfluence));
        let cubeRange = getRange(team, "", "", ScoreCalculator.Teleop.getCubes);
        let cubesScored = Math.round(!useRandom ? cubeRange.avg : biasedRandom(cubeRange.min, cubeRange.max, cubeRange[biasMethod], config.defaultInfluence));
        */
        let coneLowRange = getRange(team, "teleop", "coneLow");
        let coneMidRange = getRange(team, "teleop", "coneMid");
        let coneHighRange = getRange(team, "teleop", "coneHigh");
        let cubeLowRange = getRange(team, "teleop", "cubeLow");
        let cubeMidRange = getRange(team, "teleop", "cubeMid");
        let cubeHighRange = getRange(team, "teleop", "cubeHigh");
        
        result.teleop.coneLow = Math.round(!useRandom ? coneLowRange.avg : biasedRandom(coneLowRange.min, coneLowRange.max, coneLowRange[biasMethod], config.defaultInfluence));
        result.teleop.coneMid = Math.round(!useRandom ? coneMidRange.avg : biasedRandom(coneMidRange.min, coneMidRange.max, coneMidRange[biasMethod], config.defaultInfluence));
        result.teleop.coneHigh = Math.round(!useRandom ? coneHighRange.avg : biasedRandom(coneHighRange.min, coneHighRange.max, coneHighRange[biasMethod], config.defaultInfluence));
        result.teleop.cubeLow = Math.round(!useRandom ? cubeLowRange.avg : biasedRandom(cubeLowRange.min, cubeLowRange.max, cubeLowRange[biasMethod], config.defaultInfluence));
        result.teleop.cubeMid = Math.round(!useRandom ? cubeMidRange.avg : biasedRandom(cubeMidRange.min, cubeMidRange.max, cubeMidRange[biasMethod], config.defaultInfluence));
        result.teleop.cubeHigh = Math.round(!useRandom ? cubeHighRange.avg : biasedRandom(cubeHighRange.min, cubeHighRange.max, cubeHighRange[biasMethod], config.defaultInfluence));
        

        // Get endgame
        let ef = {};    // Endgame frequency, storing # of times each endgame occurred
        ef[EndgameResult.NONE] = 0;
        ef[EndgameResult.PARKED] = 0;
        ef[EndgameResult.DOCKED] = 0;
        ef[EndgameResult.DOCKED_AND_ENGAGED] = 0;
        team.data.forEach(match => ef[match.performance.endgame.state] ++);

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
     * @param {*} rng The seeded random generator
     */
    preCompilationCalculations: (color, performances, gameStats, rng) => {
        // Calculate if scoring locations are depleted AND number of possible links
        let links = 0, midCubes = 0, midCones = 0, highCubes = 0, highCones = 0, totalLowPieces = 0;
        performances.forEach(p => {
            // Sum each scoring location individually
            midCubes += p.auto.cubeMid + p.teleop.cubeMid;
            midCones += p.auto.coneMid + p.teleop.coneMid;
            highCubes += p.auto.cubeHigh + p.teleop.cubeHigh;
            highCones += p.auto.coneHigh + p.teleop.coneHigh;

            totalLowPieces += ScoreCalculator.Auto.getLow({performance: p}) + ScoreCalculator.Teleop.getLow({performance: p});
        });

        // Reallocation
        if (highCubes > 3) {
            // There are too many high cubes; remove some from other teams and reallocate
            let index = 0;
            while (highCubes > 3) {
                if (index > 2) {
                    // Start deducting from auto instead
                    if (performances[index - 3].auto.cubeHigh > 0) {
                        performances[index - 3].auto.cubeHigh --;
                        performances[index - 3].auto.cubeMid ++;
                        highCubes --;
                        midCubes ++;
                    }
                } else if (performances[index].teleop.cubeHigh > 0) {
                    performances[index].teleop.cubeHigh --;
                    performances[index].teleop.cubeMid ++;
                    highCubes --;
                    midCubes ++;
                }
                if (index < 5) index ++; else index = 0;
            }
        }
        if (highCones > 6) {
            // There are too many high cones; remove some from other teams and reallocate
            let index = 0;
            while (highCones > 6) {
                if (index > 2) {
                    // Start deducting from auto instead
                    if (performances[index - 3].auto.coneHigh > 0) {
                        performances[index - 3].auto.coneHigh --;
                        performances[index - 3].auto.coneMid ++;
                        highCones --;
                        midCones ++;
                    }
                } else if (performances[index].teleop.coneHigh > 0) {
                    performances[index].teleop.coneHigh --;
                    performances[index].teleop.coneMid ++;
                    highCones --;
                    midCones ++;
                }
                if (index < 5) index ++; else index = 0;
            }
        }
        if (midCubes > 3) {
            // There are too many mid cubes; remove some from other teams and reallocate
            let index = 0;
            while (midCubes > 3) {
                if (index > 2) {
                    // Start deducting from auto instead
                    if (performances[index - 3].auto.cubeMid > 0) {
                        performances[index - 3].auto.cubeMid --;
                        midCubes --;
                    }
                } else if (performances[index].teleop.cubeMid > 0) {
                    performances[index].teleop.cubeMid --;
                    performances[index].teleop.cubeLow ++;
                    midCubes --;
                    totalLowPieces ++;
                }
                if (index < 5) index ++; else index = 0;
            }
        }
        if (midCones > 6) {
            // There are too many mid cones; remove some from other teams and reallocate
            let index = 0;
            while (midCones > 6) {
                if (index > 2) {
                    // Start deducting from auto instead
                    if (performances[index - 3].auto.coneMid > 0) {
                        performances[index - 3].auto.coneMid --;
                        midCones --;
                    }
                } else if (performances[index].teleop.coneMid > 0) {
                    performances[index].teleop.coneMid --;
                    performances[index].teleop.coneLow ++;
                    midCones --;
                    totalLowPieces ++;
                }
                if (index < 5) index ++; else index = 0;
            }
        }
        if (totalLowPieces > 9) {
            // There are too many low pieces; remove some from other teams
            let index = 0;
            while (totalLowPieces > 9) {
                if (index > 2) {
                    // Start deducting from auto instead
                    if (performances[index - 3].auto.cubeLow > 0) {
                        performances[index - 3].auto.cubeLow --;
                        totalLowPieces --;
                    }
                    if (performances[index - 3].auto.coneLow > 0) {
                        performances[index - 3].auto.coneLow --;
                        totalLowPieces --;
                    }
                } else if (performances[index].teleop.coneLow > 0) {
                    performances[index].teleop.coneLow --;
                    totalLowPieces --;
                } else if (performances[index].teleop.cubeLow > 0) {
                    performances[index].teleop.cubeLow --;
                    totalLowPieces --;
                }
                if (index < 5) index ++; else index = 0;
            }
        }

        // Determine links
        links += Math.min(Math.floor(highCones / 2), highCubes);
        links += Math.min(Math.floor(midCones / 2), midCubes);
        links += Math.floor(totalLowPieces / 3);
        gameStats.links = links;
        
        // Because only one team at a time can dock in auto, check if multiple robots are docking and disable the others
        let autoDockingTeams = 0;
        performances.forEach(p => {
            autoDockingTeams += p.auto.docked;
        });
        while (autoDockingTeams > 1) {
            // Pick a random team to undock
            let teamIndex = Math.round(rng() * 2);
            if (performances[teamIndex].auto.docked || performances[teamIndex].auto.engaged) {
                performances[teamIndex].auto.docked = false;
                performances[teamIndex].auto.engaged = false;
                autoDockingTeams --;
            }
        }

        // If a robot engaged the charge station in endgame, conditionally set every other robot's endgame state to docked and engaged
        let engagedCount = 0, dockedCount = 0;
        performances.forEach((p) => {
            if (p.endgame.state == EndgameResult.DOCKED_AND_ENGAGED) {
                engagedCount ++;
            }
            if (p.endgame.state == EndgameResult.DOCKED || p.endgame.state == EndgameResult.DOCKED_AND_ENGAGED) {
                dockedCount ++;
            }
        });
        if (!(engagedCount == 0 || dockedCount <= 1 || engagedCount == dockedCount)) {
            // Make odds-based decisions based on how many robots are engaged
            const elevateAllToEngaged = () => performances.forEach(p => {
                if (p.endgame.state == EndgameResult.DOCKED) p.endgame.state = EndgameResult.DOCKED_AND_ENGAGED;
            });
            const lowerAllToDocked = () => performances.forEach(p => {
                if (p.endgame.state == EndgameResult.DOCKED_AND_ENGAGED) p.endgame.state = EndgameResult.DOCKED;
            });

            // 2 are docked, 1 is engaged. 60% chance for elevation
            if (dockedCount == 2 && engagedCount == 1 && rng() < .6) {
                elevateAllToEngaged();
            } else {
                lowerAllToDocked();
            }

            // 3 are docked, 1 is engaged. 4% chance for elevation
            if (dockedCount == 3 && engagedCount == 1 && rng() < .04) {
                elevateAllToEngaged();
            } else {
                lowerAllToDocked();
            }

            // 3 are docked, 2 are engaged. 15% chance for elevation
            if (dockedCount == 3 && engagedCount == 2 && rng() < .15) {
                elevateAllToEngaged();
            } else {
                lowerAllToDocked();
            }
        }

        // Count up charge station points
        performances.forEach(team => gameStats.chargeScore += ScoreCalculator.Auto.getChargeStationScore({ performance: team }) + ScoreCalculator.Endgame.getChargeStationScore({ performance: team }));
    },

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
        results[color].RPFreq[matchDetails[color].matchRP + (matchDetails[color].gameStats.gridRP ? 1 : 0) + (matchDetails[color].gameStats.climbRP ? 1 : 0)] ++;
        results[color].gridRPRate += matchDetails[color].gameStats.gridRP ? 1 : 0;
        results[color].climbRPRate += matchDetails[color].gameStats.climbRP ? 1 : 0;
        results[color].endgameCeiling = Math.max(results[color].endgameCeiling, matchDetails[color].endgameScore);
        results[color].autoCeiling = Math.max(results[color].autoCeiling, matchDetails[color].autoScore);

        // Find the best grid scorer, but ensure the object is populated first
        if (results[color].gridContributions == -1) {
            results[color].gridContributions = {};
            results[color].gridContributions[matchDetails[color].teamPerformances[0].teamNumber] = ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[0] });
            results[color].gridContributions[matchDetails[color].teamPerformances[1].teamNumber] = ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[1] });
            results[color].gridContributions[matchDetails[color].teamPerformances[2].teamNumber] = ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[2] });
        } else {
            results[color].gridContributions[matchDetails[color].teamPerformances[0].teamNumber] += ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[0] });
            results[color].gridContributions[matchDetails[color].teamPerformances[1].teamNumber] += ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[1] });
            results[color].gridContributions[matchDetails[color].teamPerformances[2].teamNumber] += ScoreCalculator.Teleop.getScore({ performance: matchDetails[color].teamPerformances[2] });
        }

        // Insights that are independent of what the opposing alliance did
        if (matchDetails[color].endgameScore > results[color].insights.endgameAboveThreshold.threshold) {
            results[color].insights.endgameAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.endgameAboveThreshold.wins ++
        }
        if (matchDetails[color].gameStats.chargeScore > results[color].insights.chargeStationAboveThreshold.threshold) {
            results[color].insights.chargeStationAboveThreshold.count ++;
            if (matchDetails.winner.toLowerCase() == color) results[color].insights.chargeStationAboveThreshold.wins ++
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
        results.red.gridRPRate /= config.simulations;
        results.red.climbRPRate /= config.simulations;
        results.blue.gridRPRate /= config.simulations;
        results.blue.climbRPRate /= config.simulations;
    }
}

export default SimulationInformation;