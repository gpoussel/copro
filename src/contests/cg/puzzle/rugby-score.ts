// @ts-nocheck
// 🎮 CodinGame Puzzle - rugby-score
// https://www.codingame.com/training/easy/rugby-score

const score = parseInt(readline());

// A try is 5 points, a transformation (after try) is 2 points, a penalty/drop is 3 points
// tries: 0..floor(score/5), transformations: 0..tries, penalties: remaining/3 if divisible

for (let tries = 0; tries * 5 <= score; tries++) {
  for (let transformations = 0; transformations <= tries; transformations++) {
    const remaining = score - tries * 5 - transformations * 2;
    if (remaining >= 0 && remaining % 3 === 0) {
      const penalties = remaining / 3;
      console.log(`${tries} ${transformations} ${penalties}`);
    }
  }
}
