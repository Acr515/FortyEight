import ScoreCalculator from "../ScoreCalculator/2024";

// An object containing possible weighting factors and their front-facing names.
export const Weights = {
    Autonomous: "Auto",
    Speaker: "Speaker Scoring",
    Amp: "Amp Scoring",
    Endgame: "Endgame",
    Defense: "Defense",
    Flags: "Flags",
}

/**
 * A set of well-rounded, tuned weights to use
 */
export const WeightSets = {
    WellRounded: {
        Autonomous: 1.2,
        Speaker: 1.5,
        Amp: 1.8,
        Endgame: 1.2,
        Defense: 1,
        Flags: 1
    },
    Defensive: {
        Autonomous: 1.25,
        Speaker: 0.5,
        Amp: 1.5,
        Endgame: 1.5,
        Defense: 3.5,
        Flags: 2
    }
};

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

        // Score the team's amp scoring performance
        score.Amp += match.performance.auto.amp + match.performance.teleop.amp;

        // Score the team's speaker scoring performance
        score.Speaker += match.performance.auto.speaker + match.performance.teleop.speaker;
    
        // Score the team's endgame
        score.Endgame += ScoreCalculator.Endgame.getScore(match);

        // Compile a team's defensive tendencies and how good they were
        if (match.performance.defense.played) {
            score.Defense.instances ++;
            if (match.performance.defense.rating == "Strong") score.Defense.compositeStrength ++;
        }

        // Compile a team's negative flags (penalties, break-downs)
        if (match.performance.notes.misses) score.Flags -= 1;
        if (match.performance.notes.fouls) score.Flags -= 2;
        if (match.performance.notes.broken) score.Flags -= 3.5;
    });

    let composite = 0;
    Object.keys(score).forEach(key => {
        if (key == Weights.Defense && score.Defense.instances > 0) {
            // For defense, divide by instances instead of by total matches, while also rewarding several 
            score.Defense.compositeStrength /= score.Defense.instances;
            score.Defense.compositeStrength *= (score.Defense.instances * .25) * 8;
            
            score[key].compositeStrength *= weights[key];
            composite += score[key].compositeStrength;
        }
        if (key != Weights.Defense) {
            score[key] /= team.data.length;
            score[key] *= weights[key];
            composite += score[key];
        }
    });

    score.Composite = composite;
    return score;
}