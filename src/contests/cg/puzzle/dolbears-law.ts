// @ts-nocheck
// 🎮 CodinGame Puzzle - dolbears-law
// https://www.codingame.com/training/easy/dolbears-law

const M = parseInt(readline());
const allMeasurements: number[] = [];
const minuteSums: number[] = [];

for (let i = 0; i < M; i++) {
  const measures = readline().split(' ').map(Number);
  const sum = measures.reduce((a, b) => a + b, 0);
  minuteSums.push(sum);
  allMeasurements.push(...measures);
}

// Line 1: Average of N60-based TC estimates per minute
// N60 = sum of chirps per minute, TC = 10 + (N60 - 40) / 7
const tc60Values = minuteSums.map(n60 => 10 + (n60 - 40) / 7);
const avg60 = tc60Values.reduce((a, b) => a + b, 0) / M;

console.log(avg60.toFixed(1));

// Line 2: Only if avg60 is between 5 and 30 (inclusive)
if (avg60 >= 5 && avg60 <= 30) {
  // Use N8 formula: TC = N8 + 5 where N8 = chirps in 8 seconds (pairs of 4-sec intervals)
  // If total measurements is odd, drop the last one
  let total = allMeasurements.length;
  if (total % 2 !== 0) {
    total -= 1; // ignore the last measurement
  }

  let sumTc8 = 0;
  let count = 0;
  for (let i = 0; i < total; i += 2) {
    const n8 = allMeasurements[i] + allMeasurements[i + 1];
    sumTc8 += n8 + 5;
    count++;
  }

  const avg8 = sumTc8 / count;
  console.log(avg8.toFixed(1));
}
