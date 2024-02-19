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
 * Weighs a team and outputs a composite score for it.
 * @param {object} weights Using the keys of the `Weights` object, a series of numbers between 0 and 1 to weigh the team with 
 * @param {object} team The team object to evaluate
 * @returns An object of weights mapped back to the keys of the `Weights` object, including a `Composite` key which is the sum of all the scores
 */
export default function weighTeam(weights, team) {

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
        if (match.notes.misses) score.Flags -= 0.5;
        if (match.notes.fouls) score.Flags -= 1;
        if (match.notes.broken) score.Flags -= 2;
    });

    let composite = 0;
    Object.keys(score).forEach(key => {
        if (key == Weights.Defense) {
            // For defense, divide by instances instead of by total matches, while also rewarding several 
            score.Defense.compositeStrength /= score.Defense.instances;
            score.Defense.compositeStrength *= (score.Defense.instances * .25) * 8;
        } else {
            score[key] /= team.data.length;
        }
        score[key] *= weights[key];
        composite += score[key];
    });

    score.Composite = composite;
    return score;
}