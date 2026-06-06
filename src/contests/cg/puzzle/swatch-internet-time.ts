// @ts-nocheck
// 🎮 CodinGame Puzzle - swatch-internet-time
// https://www.codingame.com/training/easy/swatch-internet-time

const rawtime = readline();

// Parse: "HH:MM:SS UTC+hh:mm" or "HH:MM:SS UTC-hh:mm"
// Format is always 18 chars: e.g. "02:24:00 UTC+01:00"
const [timePart, tzPart] = rawtime.split(' ');

const [HH, MM, SS] = timePart.split(':').map(Number);

// tzPart looks like "UTC+01:00" or "UTC-08:00" or "UTC+11:25"
const tzSign = tzPart[3] === '+' ? 1 : -1;
const tzOffset = tzPart.slice(4); // "01:00" or "08:00"
const [tzH, tzM] = tzOffset.split(':').map(Number);

// Total seconds of the input time
let totalSeconds = HH * 3600 + MM * 60 + SS;

// Offset from input timezone to UTC (in seconds)
const inputOffsetSeconds = tzSign * (tzH * 3600 + tzM * 60);

// Convert to UTC
totalSeconds -= inputOffsetSeconds;

// Convert to Biel (UTC+01:00): add 3600 seconds
totalSeconds += 3600;

// Handle day wraparound (mod 86400)
const daySeconds = 86400;
totalSeconds = ((totalSeconds % daySeconds) + daySeconds) % daySeconds;

// Compute beats: totalSeconds / 86.4, rounded to 2 decimal places using half-up rounding.
// beats * 100 = totalSeconds * 1000 / 864 (since 86.4 * 10 = 864)
// Use exact integer arithmetic to avoid floating-point precision issues.
// Half-up rounding: floor((numerator + denominator/2) / denominator)
// = floor((totalSeconds * 1000 + 432) / 864)   [since 864/2 = 432]
const numerator = BigInt(totalSeconds) * 1000n;
const denominator = 864n;
const rounded100 = (numerator + 432n) / denominator; // integer division floors

// Format with exactly 2 decimal places
const formatted = (Number(rounded100) / 100).toFixed(2);

console.log('@' + formatted);
