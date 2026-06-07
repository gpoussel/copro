// @ts-nocheck
// 🎮 CodinGame Puzzle - temperatures
// https://www.codingame.com/training/easy/temperatures

const n = parseInt(readline());
if (n === 0) {
  console.log(0);
} else {
  const temps = readline().trim().split(' ').map(Number);
  let closest = temps[0];
  for (let i = 1; i < temps.length; i++) {
    const t = temps[i];
    const absT = Math.abs(t);
    const absBest = Math.abs(closest);
    if (absT < absBest || (absT === absBest && t > 0)) {
      closest = t;
    }
  }
  console.log(closest + 0);
}
