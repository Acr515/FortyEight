import ScoreCalculator from "../ScoreCalculator/2025";

// An object containing possible weighting factors and their front-facing names.
export const Weights = {
    Autonomous: "Auto",
    Coral: "Coral Scoring",
    Algae: "Algae Scoring",
    Endgame: "Endgame",
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
        Autonomous: 2,
        Coral: 2.4,
        Algae: 2.2,
        Endgame: 1.6,
        Defense: 1,
        Flags: 1
    },
    // Composite score focuses on robot ability to support in areas besides coral
    Supportive: {
        Autonomous: 1.25,
        Coral: 0.75,
        Algae: 2.5,
        Endgame: 1.5,
        Defense: 0.5,
        Flags: 1.75
    },
    // Composite score focuses on reliable defenders with good supporting traits
    Defensive: {
        Autonomous: 1.25,
        Coral: 0.25,
        Algae: 1,
        Endgame: 1.5,
        Defense: 3.25,
        Flags: 2
    },
};

/**
 * Converts the above weight sets into readable names.
 */
export const WeightSetNames = {
    Defensive: "defensive",
    Supportive: "supportive",
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
        // Score the team's auto performance
        score.Autonomous += ScoreCalculator.Auto.getScore(match);

        // Score the team's coral scoring performance
        score.Coral += ScoreCalculator.Auto.getCoral(match) + ScoreCalculator.Teleop.getCoral(match);

        // Score the team's speaker scoring performance
        score.Algae += ScoreCalculator.Auto.getAlgae(match) + match.performance.teleop.algaeLow * 0.5 + match.performance.teleop.algaeHigh;
    
        // Score the team's endgame
        score.Endgame += ScoreCalculator.Endgame.getScore(match);

        // Compile a team's defensive tendencies and how good they were
        if (match.performance.defense.played) {
            score.Defense.instances ++;
            if (match.performance.defense.rating == "Strong") score.Defense.compositeStrength += 1.1;
            if (match.performance.defense.rating == "OK") score.Defense.compositeStrength += 0.6;
            if (match.performance.defense.rating == "Poor") score.Defense.compositeStrength += 0.2;
        }

        // Compile a team's negative flags (penalties, break-downs)
        if (match.performance.notes.misses) score.Flags -= 1;
        if (match.performance.notes.fouls) score.Flags -= 2;
        if (match.performance.notes.broken) score.Flags -= 3;
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