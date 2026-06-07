// @ts-nocheck
// 🎮 CodinGame Puzzle - ww2-mortar-warfare
// https://www.codingame.com/training/easy/ww2-mortar-warfare

const input = readline();

// Extract digits from noisy rangefinder string
const digits = input.replace(/\D/g, '');
const range = parseInt(digits, 10); // range in meters

// M2 Mortar constants
const g = 9.8;       // acceleration due to gravity (m/s^2)
const v = 158;       // initial velocity (m/s)
const MAX_RANGE = 1800; // 1.8 km
const MIN_ANGLE_DEG = 40;
const MAX_ANGLE_DEG = 85;

// Check if range is physically achievable (arcsin argument must be in [-1, 1])
const sinArg = (range * g) / (v * v);

if (range > MAX_RANGE || sinArg > 1) {
    console.log("OUT OF RANGE");
} else {
    // θ formula gives the lower of the two valid angles
    // θ = arcsin((R*g)/v^2) / 2
    const thetaLow = Math.asin(sinArg) / 2; // in radians
    const thetaLowDeg = thetaLow * (180 / Math.PI);

    // The complementary (high-arc) angle
    const thetaHighDeg = 90 - thetaLowDeg;
    const thetaHigh = thetaHighDeg * (Math.PI / 180);

    // Determine which angle is within the valid elevation range [40°, 85°]
    let chosenAngleDeg: number | null = null;
    let chosenAngle: number | null = null;

    if (thetaHighDeg >= MIN_ANGLE_DEG && thetaHighDeg <= MAX_ANGLE_DEG) {
        chosenAngleDeg = thetaHighDeg;
        chosenAngle = thetaHigh;
    } else if (thetaLowDeg >= MIN_ANGLE_DEG && thetaLowDeg <= MAX_ANGLE_DEG) {
        chosenAngleDeg = thetaLowDeg;
        chosenAngle = thetaLow;
    }

    if (chosenAngle === null) {
        console.log("OUT OF RANGE");
    } else {
        // t = (2 * v * sin(θ)) / g
        const flightTime = (2 * v * Math.sin(chosenAngle)) / g;

        // Always print exactly one decimal (a whole-number result must read "80.0",
        // never "80"), so format with toFixed(1) rather than numeric rounding.
        console.log(`${chosenAngleDeg.toFixed(1)} degrees`);
        console.log(`${flightTime.toFixed(1)} seconds`);
    }
}
