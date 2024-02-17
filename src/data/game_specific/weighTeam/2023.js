import ScoreCalculator from "../ScoreCalculator/2023";

// An object containing possible weighting factors and their front-facing names.
export const Weights = {
    Autonomous: "Auto",
    Cones: "Cone Scoring",
    Cubes: "Cube Scoring",
    Endgame: "Endgame",
    Defense: "Defense"
}

/**
 * Weighs a team and outputs a composite score for it.
 * @param {object} weights Using the keys of the `Weights` object, a series of numbers between 0 and 1 to weigh the team with 
 * @param {object} team The team object to evaluate
 * @returns An object of weights mapped back to the keys of the `Weights` object, including a `Composite` key which is the sum of all the scores
 */
export default function weighTeam({ weights, team }) {

    let score = { };
    Object.keys(Weights).forEach(key => score[key] = 0);
    score.Defense = { instances: 0, compositeStrength: 0 }; // Defense scores differently than others

    team.data.forEach(match => {
        // Score the team's auto performance
        score.Autonomous += ScoreCalculator.Auto.getScore(match);

        // Score the team's cone scoring performance
        score.Cones += ScoreCalculator.Auto.getCones(match) + ScoreCalculator.Teleop.getCones(match);

        // Score the team's cube scoring performance
        score.Cubes += ScoreCalculator.Auto.getCubes(match) + ScoreCalculator.Teleop.getCubes(match);
    
        // Score the team's endgame
        score.Endgame += ScoreCalculator.Endgame.getScore(match);

        // Compile a team's defensive tendencies and how good they were
        if (match.performance.defense.played) {
            score.Defense.instances ++;
            if (match.performance.defense.rating == "Strong") score.Defense.compositeStrength ++;
        }
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