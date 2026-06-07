// 🎮 CodinGame Puzzle - smooth
// https://www.codingame.com/training/easy/smooth

// A game starting with F fruit is won if and only if F is a 5-smooth number,
// i.e. its only prime factors are 2, 3, and 5 (so it can be divided down to 1).
// Watermelon covers n=1 (the "finishing move"), apple n=2, orange n=3, banana n=5.

function isSmooth(f: bigint): boolean {
  if (f <= 0n) return false
  while (f % 2n === 0n) f /= 2n
  while (f % 3n === 0n) f /= 3n
  while (f % 5n === 0n) f /= 5n
  return f === 1n
}

const N = parseInt(readline())
for (let i = 0; i < N; i++) {
  const F = BigInt(readline().trim())
  console.log(isSmooth(F) ? "VICTORY" : "DEFEAT")
}
