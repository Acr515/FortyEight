import ScoreCalculator from "data/game_specific/ScoreCalculator/2024";

/**
 * Runs calculations to determine a team's RPI
 * @param {object} team An entire team object
 * @returns An object containing the numerical RPI as `RPI` and a textual rating as `rating`
 */
export default function calculateRPI(team) {
    let RPI = 0, count = team.data.length;
    
    team.data.forEach(data => {
        RPI += calculateSingleRPI(data);
    });
    RPI = Math.round(RPI / count * 10) / 10;

    return { RPI: RPI, rating: getRPIRating(RPI) };
}

// Same as calculateRPI but only performs calculation on one individual match
export function calculateSingleRPI(data, round) {
    let RPI = 0;
    RPI += ScoreCalculator.Auto.getScore(data) + ScoreCalculator.Teleop.getScore(data) + ScoreCalculator.Endgame.getScore(data);

    if (data.performance.notes.fouls) RPI -= 3;

    return round ? Math.round(RPI * 10) / 10 : RPI;
}

/**
 * Takes in an RPI and returns a relative worded rating
 * @param {number} rpi The RPI of the team
 * @returns A string containing the rating
 */
export function getRPIRating(rpi) {
    if (rpi <= 5) return "Very Poor";
    else if (rpi <= 11) return "Poor";
    else if (rpi <= 17) return "Average";
    else if (rpi <= 25) return "Good";
    else if (rpi <= 32) return "Very Good";
    else if (rpi <= 41) return "Excellent";
    else return "Godly";
}