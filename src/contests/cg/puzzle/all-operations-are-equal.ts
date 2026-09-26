// 🎮 CodinGame Puzzle - all-operations-are-equal
// https://www.codingame.com/training/medium/all-operations-are-equal

// With K the common value: C = K/E, so K = C*E, A = C*E - E, B = C*E + E, D = C*E².
// X = A + B + C + D = C * (E + 1)², with A > 0 requiring C >= 2 and E >= 1.
function isGood(x: number): boolean {
  for (let t = 2; 2 * t * t <= x; t++) if (x % (t * t) === 0) return true
  return false
}

const n = parseInt(readline())
for (let i = 0; i < n; i++) console.log(isGood(parseInt(readline())) ? "YES" : "NO")
