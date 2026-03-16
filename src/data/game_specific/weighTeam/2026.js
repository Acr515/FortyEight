import ScoreCalculator from "../ScoreCalculator/2026";

// An object containing possible weighting factors and their front-facing names.
export const Weights = {
    Autonomous: "Auto",
    Accuracy: "Accuracy",
    Cycles: "Cycles",
    Tower: "Tower",
    Defense: "Defense",
    Flags: "Flags",
}

/**
 * Sets of tuned weights to use. Adding another weight set here will add another category
 * for a team to be ranked "the best" in. Order by priority or importance
 */
export const WeightSets = {
    // Every year must have a `WellRounded` set, which uses a wholistic approach to analyze a team
    WellRounded: {
        Autonomous: 1.5,
        Cycles: 0.5,
        Accuracy: 1,
        Tower: 1.25,
        Defense: 1,
        Flags: 1
    },
    // Composite score focuses on autonomous performance with good supporting traits
    Autonomous: {
        Autonomous: 3.5,
        Cycles: 1.5,
        Accuracy: 2,
        Tower: 2,
        Defense: 0.125,
        Flags: 1.5
    },
    // Composite score focuses on reliable defenders with good supporting traits
    Defensive: {
        Autonomous: 1.5,
        Cycles: 0.25,
        Accuracy: 0.5,
        Tower: 1,
        Defense: 3.5,
        Flags: 2.25
    },
};

/**
 * Converts the above weight sets into readable names.
 */
export const WeightSetNames = {
    Defensive: "defensive",
    Autonomous: "autonomous",
    WellRounded: "well-rounded",
}

/**
 * Weighs a team and outputs a composite score for it.
 * @param {object} team The team object to evaluate
 * @param {object} weights Using the keys of the `Weights` object, a series of numbers between 0 and 1 to weigh the team with 
 * @returns An object of weights mapped back to the keys of the `Weights` object, including a `Composite` key which is the sum of all the scores
 */
export default function weighTeam(team, weights) {

    let score = { };
    Object.keys(Weights).forEach(key => score[key] = 0);
    score.Defense = { instances: 0, compositeStrength: 0 }; // Defense scores differently than others

    team.data.forEach(match => {
        // Score the team's overall auto performance
        score.Autonomous += ScoreCalculator.Auto.getScore(match);

        // Score the team's accuracy (teleop)
        score.Accuracy += match.performance.teleop.accuracy;

        // Score the team's ability to cycle (teleop)
        score.Cycles += match.performance.teleop.cycles * match.performance.teleop.fuel;

        // Score the team's tower points
        score.Tower += ScoreCalculator.Endgame.getScore(match) + match.performance.auto.state && 15;

        // Compile a team's defensive tendencies and how good they were
        if (match.performance.defense.played) {
            score.Defense.instances ++;
            if (match.performance.defense.rating == "Strong") score.Defense.compositeStrength += 2.2;
            if (match.performance.defense.rating == "OK") score.Defense.compositeStrength += 1.2;
            if (match.performance.defense.rating == "Poor") score.Defense.compositeStrength += 0.5;
        }

        // Compile a team's negative flags (penalties, break-downs)
        if (match.performance.notes.misses) score.Flags -= 2;
        if (match.performance.notes.fouls) score.Flags -= 4;
        if (match.performance.notes.broken) score.Flags -= 5;
    });

    let composite = 0;
    Object.keys(score).forEach(key => {
        if (key == Weights.Defense && score.Defense.instances > 0) {
            // For defense, divide by instances instead of by total matches, while also rewarding several 
            score.Defense.compositeStrength /= score.Defense.instances;
            score.Defense.compositeStrength *= (score.Defense.instances * .35) * 8;
            
            score[key].compositeStrength *= weights[key];
            score[key] = score[key].compositeStrength;  // remove object structure & replace with single number
        } else if (key == Weights.Defense && score.Defense.instances == 0) score.Defense = 0;
        score[key] /= team.data.length;
        score[key] *= weights[key];
        score[key] = Math.round(score[key] * 10) / 10;
        composite += score[key];
    });

    score.Composite = composite;
    return score;
}