import { DEVELOP_MODE } from "/src/config";
import hitTBA from "util/hitTBA";
import weighTeam, { WeightSets } from "./game_specific/weighTeam/GAME_YEAR";
import { getTeamData } from "./SearchData";
import calculateRPI, { getRPIRating } from "./game_specific/calculateRPI/GAME_YEAR";
import { WeightSetNames, Weights } from "./game_specific/weighTeam/GAME_YEAR";
import ScoreCalculator from "./game_specific/ScoreCalculator/GAME_YEAR";
import Simulator from "./game_specific/Simulator/_Universal";

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
    draftState: {
        round: 1,
        alliance: 0
    },
    config: {
        fullTBAData: false,                 // Whether or not ranking data was supplied by TBA
        backupSelections: false,            // Whether or not to add a third round of selections to the draft (i.e. world championship style selection)
        useSimulation: true,                // Whether to use simulation to inform the picklist generator
        numberOfSimulatedFillerOptions: 3,  // Number of different "fill-in" options used when the opponent alliance in the simulator hasn't filled their alliance yet
        simulatedMatches: 400,              // Number of matches to simulate with each available team
        weightOfSimulations: 0.65,          // The factor used to change team value based on simulated outcomes. Must be greater than 0
        weightOfUniqueStrengths: 0.75,      // The factor used to change team value based on how much better it is than its partners in different scoring categories
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
        playoffHelper.draftState = {
            round: 1,
            alliance: 0
        };
        playoffHelper.teams.forEach(team => PlayoffTeam.flush(team));

        phSetter(playoffHelper);
    },

    /**
     * Deletes all information and resets the playoff helper.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     */
    reset: (ph, phSetter) => {
        let playoffHelper = clonePlayoffHelper(PlayoffHelperData);

        localStorage.removeItem("playoffHelper");
        playoffHelper.teams = [];
        playoffHelper.alliances = [];
        playoffHelper.draftState = {
            round: 1,
            alliance: 0
        };

        phSetter(playoffHelper);
    },

    /**
     * Readies the playoff helper for alliance selection, real-time or simulated.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {PlayoffHelperState} mode Either `SIMULATED_DRAFT` or `LIVE_DRAFT` based on user input
     * @param {boolean} backupSelections If true, alliances will have four teams
     * @returns 1 if successful, 0 otherwise
     */
    setup: (ph, phSetter, mode, backupSelections) => {
        let playoffHelper = clonePlayoffHelper(ph);
        
        // Run calculations on playoff teams
        let emptyTeams = [];
        playoffHelper.teams.forEach(team => {
            PlayoffTeam.flush(team);
            let returnValue = team.calculatePowerScores();
            if (returnValue !== null) emptyTeams.push(returnValue);
        });
        if (emptyTeams.length > 0) {
            // Throw error
            phSetter(playoffHelper);
            console.error("Analysis was halted- the following teams don't have data in memory: " + emptyTeams.toString());
            return 0;
        }

        // Rank every attribute of every team
        let sortedTeams = [...playoffHelper.teams];
        Object.keys(Weights).forEach(weight => {
            if (weight == Weights.Flags) return;
            sortedTeams.sort((a, b) => b.powerScores.WellRounded[weight] - a.powerScores.WellRounded[weight]);  // sort by well-rounded scores (WellRounded should always exist)
            sortedTeams.forEach((team, ranking) => { team.powerScoreRankings[weight] = ranking + 1 });
        });
        // Also do the same for RPI
        sortedTeams.sort((a, b) => b.rpi.RPI - a.rpi.RPI);
        sortedTeams.forEach((team, ranking) => { team.rpi.ranking = ranking + 1 });
        // And do the same for average cycles
        sortedTeams.sort((a, b) => b.cycleRate - a.cycleRate);
        sortedTeams.forEach((team, ranking) => { team.cycleRateRanking = ranking + 1 });

        // Setup the draft and initial alliance captains
        playoffHelper.teams.sort((a, b) => a.qualRanking - b.qualRanking);
        for (let i = 0; i < 8; i ++) {
            playoffHelper.alliances.push([playoffHelper.teams[i].teamNumber]);
        }
        playoffHelper.teams[0].captain = true;

        // Setup config and state
        playoffHelper.state = mode;
        playoffHelper.config.backupSelections = backupSelections;

        phSetter(playoffHelper);
        return 1;
    },

    /**
     * Finishes the draft.
     */
    finishDraft: (ph, phSetter) => {
        let playoffHelper = clonePlayoffHelper(ph);

        playoffHelper.draftState = {
            round: 1,
            alliance: 0
        };

        if (playoffHelper.state == PlayoffHelperState.LIVE_DRAFT) playoffHelper.state = PlayoffHelperState.LIVE_PLAYOFFS;
        if (playoffHelper.state == PlayoffHelperState.SIMULATED_DRAFT) playoffHelper.state = PlayoffHelperState.SIMULATED_PLAYOFFS;

        // Save to localStorage
        PlayoffHelperFunctions.saveDraftResults(playoffHelper);
        
        phSetter(playoffHelper);
    },

    /**
     * Saves playoff helper data to localStorage.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     */
    saveDraftResults: (ph) => {
        let playoffHelper = clonePlayoffHelper(ph);
        localStorage.setItem("playoffHelper", JSON.stringify({ state: playoffHelper.state, teams: playoffHelper.teams, alliances: playoffHelper.alliances }));
    },

    /**
     * Loads a finished draft into the system from localStorage.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     */
    loadDraftResults: (ph, phSetter) => {
        let playoffHelper = clonePlayoffHelper(ph);

        let savedData = localStorage.getItem("playoffHelper");
        if (savedData != null) {
            savedData = JSON.parse(savedData);
            playoffHelper.alliances = savedData.alliances;
            playoffHelper.state = savedData.state;
            let baseTeams = savedData.teams;

            // Duplicate all teams, adding class methods back to their definitions
            playoffHelper.teams = baseTeams.map(team => {
                let baseTeam = new PlayoffTeam(-1, -1);
                return Object.assign(Object.create(Object.getPrototypeOf(baseTeam)), team);
            });
        }

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
        localStorage.removeItem("playoffHelper");

        hitTBA(`event/${eventKey}/rankings`, data => {
            data.rankings.forEach(team => {
                // Add to teams array
                playoffHelper.teams.push(new PlayoffTeam(
                    Number(team.team_key.replace("frc", "")),
                    team.rank,
                    [ team.record.wins, team.record.losses, team.record.ties ],
                    // Math.round(team.extra_stats[0] / team.matches_played * 100) / 100 // Formerly RP score
                ));
            })
            playoffHelper.config.fullTBAData = true;
            playoffHelper.state = PlayoffHelperState.READY;

            PlayoffHelperFunctions.saveDraftResults(playoffHelper);
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
        let playoffHelper = clonePlayoffHelper(ph);

        teams.forEach((team, ind) => {
            playoffHelper.teams.push(new PlayoffTeam(
                team,
                ind + 1
            ));
        });
        playoffHelper.state = PlayoffHelperState.READY;

        PlayoffHelperFunctions.saveDraftResults(playoffHelper);
        phSetter(playoffHelper);
    },

    /**
     * Gets playoff information from a given team number.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {number} teamNumber The team number of the `PlayoffTeam` to retrieve
     * @returns A `PlayoffTeam` object, null if the team can't be found
     */
    getTeam(ph, teamNumber) {
        let returnTeam = null;
        ph.teams.forEach(team => {
            if (team.teamNumber == teamNumber) {
                returnTeam = team;
                return;
            }
        });
        return returnTeam;
    },

    /**
     * Picks a team and advances the playoff selection process.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {number} teamNumber The team number to pick
     */
    pickTeam(ph, phSetter, teamNumber) {
        let playoffHelper = clonePlayoffHelper(ph);

        // Add the team to the alliance
        let teamObj = PlayoffHelperFunctions.getTeam(playoffHelper, teamNumber);
        playoffHelper.alliances[playoffHelper.draftState.alliance].push(teamNumber);

        // Set team to unavailable
        teamObj.selected = true;

        // Advance to the next pick, but keep track of when to serpentine the other direction or end the draft
        if (playoffHelper.draftState.alliance == 7) {
            // Alliance 8 has chosen
            if (playoffHelper.draftState.round == 1) {
                playoffHelper.draftState.round = 2; 
            } else if (playoffHelper.config.backupSelections && playoffHelper.draftState.round == 3) {
                // The draft is over (round 3)
                PlayoffHelperFunctions.finishDraft(playoffHelper, phSetter);
                return;
            } else playoffHelper.draftState.alliance = 6;   // Alliance 7 is up
        } else if (playoffHelper.draftState.alliance == 0) {
            // Alliance 1 has chosen
            if (playoffHelper.draftState.round == 2 && playoffHelper.config.backupSelections) {
                playoffHelper.draftState.round = 3;
            } else if (playoffHelper.draftState.round == 2) {
                // The draft is over (round 2)
                PlayoffHelperFunctions.finishDraft(playoffHelper, phSetter);
                return;
            } else playoffHelper.draftState.alliance = 1;   // Alliance 2 is up
        } else {
            // Any other alliance has chosen
            playoffHelper.draftState.alliance += (playoffHelper.draftState.round % 2 == 1 ? 1 : -1);
        }

        // Move up alliance captain order if in 1st round
        if (playoffHelper.draftState.round == 1) {

            // First remove any selected teams or current captains
            let newRankingOrder = [...playoffHelper.teams];
            for (let i = newRankingOrder.length - 1; i >= 0; i--) {
                let team = newRankingOrder[i];
                if (team.captain || team.selected) { 
                    newRankingOrder.splice(i, 1);
                }
            }

            // Iterate over alliances and realign the captains
            let nextIndex = 0;
            playoffHelper.alliances.forEach(alliance => {
                if (alliance.length < 2) {
                    // Move a captain up
                    alliance[0] = newRankingOrder[nextIndex].teamNumber;
                    nextIndex ++;
                }
            });

            // Current picking team is locked into captainship
            PlayoffHelperFunctions.getTeam(playoffHelper, playoffHelper.alliances[playoffHelper.draftState.alliance]).captain = true;
        }

        phSetter(playoffHelper);
    },

    /**
     * Sets a team's status to declined, exempting them from being picked.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {number} teamNumber The team number that is declining
     */
    declineTeam(ph, phSetter, teamNumber) {
        let playoffHelper = clonePlayoffHelper(ph);

        // Set team to unavailable
        let teamObj = PlayoffHelperFunctions.getTeam(playoffHelper, teamNumber);
        teamObj.declined = true;

        phSetter(playoffHelper);
    },

    /**
     * Assigns a robot to an alliance as a back-up.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     * @param {number} teamNumber The team number to pick
     * @param {number} allianceSeed The seed to assign to
     */
    addBackupTeam(ph, phSetter, teamNumber, allianceSeed) {
        let playoffHelper = clonePlayoffHelper(ph);

        let team = PlayoffHelperFunctions.getTeam(playoffHelper, teamNumber);
        team.selected = true;
        playoffHelper.alliances[allianceSeed].push(teamNumber);
        localStorage.setItem("playoffHelper", JSON.stringify({ state: playoffHelper.state, teams: playoffHelper.teams, alliances: playoffHelper.alliances }));

        phSetter(playoffHelper);
    },

    /**
     * Given a number, returns a letter grade. Used to convert numerical draft grades to a letter.
     * @param {number} number The number to convert
     * @returns A string letter grade
     */
    convertNumberToLetter(number) {
        if (number > 3.7) return "A+";
        if (number > 3.3) return "A";
        if (number > 3.0) return "A-";
        if (number > 2.7) return "B+";
        if (number > 2.4) return "B";
        if (number > 2) return "B-";
        if (number > 1.7) return "C+";
        if (number > 1.3) return "C";
        if (number > 1) return "C-";
        if (number > 0.7) return "D";
        return "F";
    },

    /**
     * Gets the RPI information of a full alliance.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {number} seed The seed # of the alliance to calculate
     * @returns An RPI object with keys RPI and rating
     */
    getAllianceRPI(ph, seed) {
        let playoffHelper = clonePlayoffHelper(ph);

        let teams = playoffHelper.alliances[seed].map(team => getTeamData(team));
        let totalRPI = 0;

        teams.forEach(team => {
            if (team !== null) totalRPI += calculateRPI(team).RPI;
        });
        
        return { RPI: Math.round(totalRPI * 10) / 10, rating: getRPIRating(totalRPI / teams.length) }
    },

    /**
     * Generates a list of teams in descending order of value that may be picked.
     * Automatically takes into account which alliance is picking, what round it is, 
     * and which teams are still available.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {boolean} useSimulation Optional. Defaults to true. When true AND the first round is over, simulates matches to find the best fit for the alliance
     */
    async generatePicklist(ph, useSimulation = true) {
        let picklist = [...ph.teams];

        // First, remove any teams who are unavailable for any reason
        for (let i = picklist.length - 1; i >= 0; i--) {
            let team = picklist[i];
            if (team.captain || team.selected || team.declined) { 
                picklist.splice(i, 1);
            }
        }

        // Then, calculate uniqueStrengthAdded (also resets whatever the last value was)
        if (ph.config.weightOfUniqueStrengths > 0) {
            let pickingAlliance = ph.alliances[ph.draftState.alliance].map(num => PlayoffHelperFunctions.getTeam(ph, num));
            picklist.forEach(candidate => {
                candidate.uniqueStrengthAdded = 0;
                Object.keys(Weights).forEach(weight => {
                    let candidateScore = candidate.powerScores.WellRounded[weight];
                    let bestAllianceScore = Math.max(...pickingAlliance.map( team => team.powerScores.WellRounded[weight]))
                    if (candidateScore > bestAllianceScore) {
                        // This team has a better power score than the best of the alliance, so it should be logged
                        candidate.uniqueStrengthAdded += (candidateScore - bestAllianceScore) * ph.config.weightOfUniqueStrengths;
                    }
                });
            });
            // Rank teams by this attribute
            picklist.sort((a, b) => b.uniqueStrengthAdded - a.uniqueStrengthAdded);
            picklist.forEach((team, ranking) => { team.uniqueStrengthAddedRank = ranking + 1 });
        }

        // Sort by best composite scores (this will happen again later)
        picklist.sort((a, b) => (b.bestCompositeScore + b.uniqueStrengthAdded) - (a.bestCompositeScore + a.uniqueStrengthAdded));

        // Then, add flags for which teams have the best score in each weight group; must remove them first though
        picklist.forEach(team => team.bestCompositeType = null);
        let categories = [...Object.keys(WeightSets)];
        let bestTeams = {};
        categories.forEach(category => {
            bestTeams[category] = null;
            picklist.forEach(team => {
                if (bestTeams[category] == null || team.powerScores[category].Composite > bestTeams[category].powerScores[category].Composite) {
                    // Make sure every team only gets one tag
                    let teamExists = false;
                    Object.keys(bestTeams).forEach(category => {
                        if (bestTeams[category] != null && bestTeams[category].teamNumber == team.teamNumber) teamExists = true;
                    });
                    if (!teamExists) bestTeams[category] = team;
                }
                team.bestCompositeType = null;  // resetting this attribute
            });
        });
        Object.keys(bestTeams).forEach(category => bestTeams[category].bestCompositeType = WeightSetNames[category]);

        // Apply simulated percentages to picklist robots, only in round 2 and if flag is true
        if (ph.draftState.round == 2 && useSimulation) {
            // Make a temporary playoff helper and determine method to proceed
            let simulatedPh = clonePlayoffHelper(ph);
            let fillerTeams = [];
            let pickingAllianceNumbers = ph.alliances[ph.draftState.alliance];
            let opponentSeed = 7 - ph.draftState.alliance;

            // Deep-copy information so that we don't change the real values of these objects (strips class functionality !!!)
            simulatedPh.alliances = ph.alliances.map(a => [...a]);
            simulatedPh.teams = ph.teams.map(t => { return {...t} });
            simulatedPh.draftState = { ...simulatedPh.draftState };

            // Check if we need to simulate a few picks because the alliance on the clock faces an opponent who hasn't finished picking yet
            if (ph.draftState.alliance > 3) {
                let picksAwayFromOpponent = ph.draftState.alliance - 4; // 5 seed (index 4) is 1 (5 minus 4) picks away from their opponent picking

                while (picksAwayFromOpponent > 0) {
                    // Pick teams and advance the simulatedPh
                    let chalkPicklist = await PlayoffHelperFunctions.generatePicklist(simulatedPh, false);                       // shouldn't use simulations at this point to prevent infinite loop
                    PlayoffHelperFunctions.pickTeam(simulatedPh, nph => simulatedPh = nph, chalkPicklist[0].teamNumber);   // skim off the top team from the picklist, also advances our "mock draft" at the same time
                    picksAwayFromOpponent --;
                }

                // Put the top X (see config) picklist teams into the fillerTeams array and cycle back-and-forth between them during the following trials
                let opponentPicklist = await PlayoffHelperFunctions.generatePicklist(simulatedPh, false);
                let picksAdded = 0;
                while (picksAdded < ph.config.numberOfSimulatedFillerOptions) {
                    fillerTeams.push(opponentPicklist[picksAdded]);
                    picksAdded ++;
                }
            }
            
            // Begin running simulations
            for (let candidateTeam of picklist) {
                // Creates and runs the simulator, returns a win rate with those teams in the match
                const runSim = async (candidate, filler = null) => {
                    let sim = new Simulator(
                        [...pickingAllianceNumbers, candidate.teamNumber],                                                                         // red alliance, always the picking team
                        (filler === null ? simulatedPh.alliances[opponentSeed] : [...simulatedPh.alliances[opponentSeed], filler.teamNumber]), {   // blue alliance, always 1st round opponent
                            simulations: (ph.config.simulatedMatches / ph.config.numberOfSimulatedFillerOptions),
                            applyDefense: true,
                        }
                    );
                    let simResults = null;
                    await sim.run((outcome) => {
                        simResults = outcome;
                    });
                    return simResults;
                };

                if (fillerTeams.length > 0) {
                    let winRate = 0;
                    for (let fillerTeam of fillerTeams) {
                        let simulation = await runSim(candidateTeam, fillerTeam);
                        winRate += simulation.red.winRate;
                    }
                    candidateTeam.simulatedWinRate = ph.config.weightOfSimulations + (winRate / fillerTeams.length);
                } else {
                    let simulation = await runSim(candidateTeam);
                    candidateTeam.simulatedWinRate = ph.config.weightOfSimulations + simulation.red.winRate;
                }
            }

            // Add rankings for teams based on this attribute
            picklist.sort((a, b) => b.simulatedWinRate - a.simulatedWinRate);
            picklist.forEach((team, ranking) => { team.simulatedWinRateRank = ranking + 1 });

            // Finally, re-score the old set of rankings using simulated win rates
            picklist.sort((a, b) => (b.bestCompositeScore * b.simulatedWinRate) - (a.bestCompositeScore * a.simulatedWinRate));
        } else picklist.forEach(team => { team.simulatedWinRate = -1; team.simulatedWinRateRank = 0; });

        // Sort picks and grade them
        const getAdjCompScore = team => (team.bestCompositeScore + team.uniqueStrengthAdded) * (team.simulatedWinRate == -1 ? 1 : team.simulatedWinRate);
        picklist.sort((a, b) => getAdjCompScore(b) - getAdjCompScore(a));
        let max = getAdjCompScore(picklist[0]), min = getAdjCompScore(picklist[picklist.length - 1]);
        let conv = (max - min) / 4;
        picklist.forEach(team => team.pickGrade = PlayoffHelperFunctions.convertNumberToLetter((getAdjCompScore(team) - min) / conv));

        // Return the picklist
        return picklist;
    },

    /**
     * Simulates the entire alliance selection process and advances to the next state. State must be set to SIMULATED_DRAFT before execution.
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     * @param {function} phSetter The state setter from the FRAME screen
     */
    simulateDraft: async (ph, phSetter) => {
        let playoffHelper = clonePlayoffHelper(ph);

        // Picks the best available team for each selection until the draft state changes
        let picks = playoffHelper.config.backupSelections ? 24 : 16;
        while (picks > 0) {
            console.log(`Alliance ${playoffHelper.draftState.alliance + 1} is picking...`);
            let picklist = await PlayoffHelperFunctions.generatePicklist(playoffHelper, true);
            PlayoffHelperFunctions.pickTeam(playoffHelper, phSetter, picklist[0].teamNumber);
            picks --;
        }
        console.log("Simulated draft was terminated");
        PlayoffHelperFunctions.finishDraft(playoffHelper, phSetter);
    },

    /**
     * Simulates the entire event based on playoff draft outcome. Defaults to the 
     * @param {PlayoffHelperData} ph The state object containing the playoff helper data
     */
    simulateBracket: async (ph) => {
        class PlayoffMatch {
            redTeams;
            blueTeams;
            redSeed;
            blueSeed;
            redWinRate;
            blueWinRate;
            winningSeed;
            losingSeed;
            matchNumber;

            constructor(matchNumber, redSeed, blueSeed) {
                this.matchNumber = matchNumber;
                this.redSeed = redSeed;
                this.blueSeed = blueSeed;
                this.redTeams = ph.alliances[redSeed];
                this.blueTeams = ph.alliances[blueSeed];
            }

            // Runs the simulator and stores win rate information about the match
            async runSim() {
                let sim = new Simulator(
                    this.redTeams.length > 3 ? this.redTeams.slice(0, 3) : this.redTeams,
                    this.blueTeams.length > 3 ? this.blueTeams.slice(0, 3) : this.blueTeams, {
                        applyDefense: true,
                    }
                );
                await sim.run((outcome) => {
                    this.redWinRate = outcome.red.winRate;
                    this.blueWinRate = outcome.blue.winRate;
                    this.winningSeed = this.redWinRate < this.blueWinRate ? this.blueSeed : this.redSeed;
                    this.losingSeed = this.redWinRate < this.blueWinRate ? this.redSeed : this.blueSeed;

                    this.redWinRate = Math.round(this.redWinRate * 1000) / 10;
                    this.blueWinRate = Math.round(this.blueWinRate * 1000) / 10;
                });
                return;
            }
        }

        let matches = [];   // two-dimensional array of rounds, broken up into matches

        // Round 1: 1v8, 4v5, 2v7, 3v6
        matches[0] = [
            new PlayoffMatch(1, 0, 7), // Match 1
            new PlayoffMatch(2, 3, 4), // Match 2
            new PlayoffMatch(3, 1, 6), // Match 3
            new PlayoffMatch(4, 2, 5), // Match 4
        ];
        for (let match of matches[0]) { await match.runSim(); }

        // Round 2: L1 vs L2, L3 vs L4, W1 vs W2, W3 vs W4
        matches[1] = [
            new PlayoffMatch( 5, matches[0][0].losingSeed, matches[0][1].losingSeed ), // Match 5 (Lower)
            new PlayoffMatch( 6, matches[0][2].losingSeed, matches[0][3].losingSeed ), // Match 6 (Lower)
            new PlayoffMatch( 7, matches[0][0].winningSeed, matches[0][1].winningSeed ), // Match 7
            new PlayoffMatch( 8, matches[0][2].winningSeed, matches[0][3].winningSeed ), // Match 8
        ];
        for (let match of matches[1]) { await match.runSim(); }

        // Round 3: W6 vs L7, W5 vs L8
        matches[2] = [
            new PlayoffMatch( 9, matches[1][2].losingSeed, matches[1][1].winningSeed ), // Match 9 (Lower)
            new PlayoffMatch( 10, matches[1][3].losingSeed, matches[1][0].winningSeed ), // Match 10 (Lower)
        ];
        for (let match of matches[2]) { await match.runSim(); }

        // Round 4: W7 vs W8, W9 vs W10
        matches[3] = [
            new PlayoffMatch( 11, matches[1][2].winningSeed, matches[1][3].winningSeed ), // Match 11
            new PlayoffMatch( 12, matches[2][0].winningSeed, matches[2][1].winningSeed ), // Match 12 (Lower)
        ];
        for (let match of matches[3]) { await match.runSim(); }

        // Round 5: L11 vs W12
        matches[4] = [
            new PlayoffMatch( 13, matches[3][0].losingSeed, matches[3][1].winningSeed ), // Match 13 (Lower)
        ];
        for (let match of matches[4]) { await match.runSim(); }

        // Round 6 (Championship: W13 vs W11)
        matches[5] = [
            new PlayoffMatch( 14, matches[3][0].winningSeed, matches[4][0].winningSeed ), // Match 14 (Championship)
        ];
        for (let match of matches[5]) { await match.runSim(); }

        return matches;
    }
};

export default PlayoffHelperFunctions;

/**
 * Encaspulated data about every team being considered for a playoff spot.
 */
export class PlayoffTeam {
    teamNumber;
    qualRanking;
    wins;
    losses;
    ties = 0;
    captain = false;                // whether or not this team is an alliance captain
    selected = false;               // whether or not this team has been selected by an alliance
    declined = false;               // whether or not this team has declined a request to be selected (still eligible to be a captain)
    powerScores = {};               // a dictionary produced by each available WeightSet plugged into the weighTeams() function
    powerScoreRankings = {};        // how the team ranks against the field in each weight category available
    bestCompositeScore = -1000;     // the best composite score from each WweightSet composite (for example, team is a 40 in WellRounded and a 50 in Defensive- this value will be 50)
    bestCompositeType = null;       // if this team has the best composite score available in a certain WeightSet group, the name of that group will populate here
    cycleRate = 0;                  // average number of game pieces scored during teleop
    cycleRateRanking = -1;          // average number of game pieces scored during teleop
    pickGrade = null;               // estimated letter grade of how good this pick would be given the rest of the teams available
    simulatedWinRate = -1;          // win rate as determined by simulations- by default, 1.5 = 100%, 0.5 = 0%. See config object of playoff helper
    simulatedWinRateRank = 0;       // ranking against the picklist for the above attribute
    uniqueStrengthAdded = -1;       // quantifies the unique value that this team would bring to the alliance- the higher the number, the stronger this team is in a category that its prospective partners are weaker in
    uniqueStrengthAddedRank = 0;    // ranking against the picklist for the above attribute
    rpi = { RPI: -1, rating: "???" };

    /**
     * Creates a PlayoffTeam for use in PlayoffHelperData. The constructor also runs calculations for aggregate stats immediately upon creation.
     * @param {Number} teamNumber The team number of the robot
     * @param {Number} qualRanking The team's qualification round ranking
     * @param {Array} wlt Optional. Wins, losses, ties in qualification round
     */
    constructor(teamNumber, qualRanking, wlt = [-1, -1, -1]) {
        this.teamNumber = teamNumber;
        this.qualRanking = qualRanking;
        this.wins = wlt[0];
        this.losses = wlt[1];
        this.ties = wlt[2];
    }

    /**
     * Gets the team's full record in qualification matches. If information is not available, returns an empty string.
     * @returns Readable string of the team's qualifying record
     */
    getRecord() { return this.wins == -1 ? "" : `${ this.wins }-${ this.losses }${ this.ties > 0 ? `-${ this.ties }` : "" }` }

    /**
     * Runs the calculateRPI() function on itself and stores the value in the `rpi` class member. This will reset the team's RPI ranking.
     */
    calculateRPI() {
        this.rpi = calculateRPI(getTeamData(this.teamNumber));
        this.rpi.ranking = 0;
    }

    /**
     * Sets all playoff selection related variables to their default values when instances still have this function
     */
    flushSelf() {
        this.captain = false;
        this.selected = false;
        this.declined = false;
        this.pickGrade = null;
        this.simulatedWinRate = -1;
        this.simulatedWinRateRank = 0;
        this.uniqueStrengthAdded = -1;
        this.uniqueStrengthAddedRank = 0; 
    }

    /**
     * Sets all playoff selection related variables to their default values.
     */
    static flush(team) {
        team.captain = false;
        team.selected = false;
        team.declined = false;
        team.pickGrade = null;
        team.simulatedWinRate = -1;
        team.simulatedWinRateRank = 0;
        team.uniqueStrengthAdded = -1;
        team.uniqueStrengthAddedRank = 0; 
    }

    /**
     * Calculates and stores weighted scores. Should be run before any analysis begins.
     */
    calculatePowerScores() {

        // Check if team exists or not
        if (getTeamData(this.teamNumber) == null) {
            // Team doesn't exist; pitch a fit if we aren't in development mode
            if (DEVELOP_MODE) {
                // Fill with fake data
                this.powerScores.WellRounded = WeightSets.WellRounded;
                this.powerScores.WellRounded.Composite = 10;
                
                this.powerScores.Defensive = WeightSets.Defensive;
                this.powerScores.Defensive.Composite = 10;

                this.bestCompositeScore = 10;

                return null;
            } else {
                return this.teamNumber; // incident will be logged and reported
            }
        } else {
            // Calculate cycle rate
            let cycles = 0;
            let teamData = getTeamData(this.teamNumber).data;
            teamData.forEach(match => cycles += ScoreCalculator.Teleop.getPieces(match));
            this.cycleRate = Math.round( cycles / teamData.length * 100 ) / 100
        }

        this.calculateRPI();
        Object.keys(WeightSets).forEach(setName => {
            let scores = weighTeam(getTeamData(this.teamNumber), WeightSets[setName]);
            if (WeightSetNames[setName] == WeightSetNames.Defensive && scores.Defense == 0) scores.Composite = -100;

            this.powerScores[setName] = scores;
            if (scores.Composite > this.bestCompositeScore) {
                this.bestCompositeScore = scores.Composite;
            }
        });
        return null;
    }
}