export default function calculateRPI(team) {
    let RPI = 0, count = team.data.length;
    
    team.data.forEach(data => {
        RPI += calculateSingleRPI(data);
    });

    return Math.round(RPI / count * 10) / 10;
}

// Same as calculateRPI but only performs calculation on one individual match
export function calculateSingleRPI(data) {
    let RPI = Number(data.performance.pieces) * 4;
    return Math.round(RPI * 10) / 10;
}