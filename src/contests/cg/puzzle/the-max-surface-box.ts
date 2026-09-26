// 🎮 CodinGame Puzzle - the-max-surface-box
// https://www.codingame.com/training/hard/the-max-surface-box

// Enumerate every factorisation N = a*b*c with a <= b <= c (a up to the cube
// root, b up to the square root of N/a) and track the min/max surface.

const N = Number(readline().trim())
let min = Infinity
let max = -Infinity
for (let a = 1; a * a * a <= N; a++) {
  if (N % a !== 0) continue
  const rest = N / a
  for (let b = a; b * b <= rest; b++) {
    if (rest % b !== 0) continue
    const c = rest / b
    const surface = 2 * (a * b + b * c + a * c)
    min = Math.min(min, surface)
    max = Math.max(max, surface)
  }
}
console.log(`${min} ${max}`)
