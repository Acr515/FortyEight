export default function calculateRPI(team) {
    let RPI = 0, count = team.data.length;
    
    team.data.forEach(data => {
        RPI += Number(data.performance.pieces) * 4;
    });

    return Math.round(RPI / count * 10) / 10;
}