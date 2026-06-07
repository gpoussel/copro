// 🎮 CodinGame Puzzle - morellets-random-lines
// https://www.codingame.com/training/easy/morellets-random-lines

const [xA, yA, xB, yB] = readline().split(" ").map(Number)
const n = parseInt(readline())

// Normalize a line (a, b, c) so we can detect duplicates.
// We normalize by dividing by GCD and ensuring the leading non-zero coefficient is positive.
function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function normalizeKey(a: number, b: number, c: number): string {
  const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1
  let na = a / g
  let nb = b / g
  let nc = c / g
  // Ensure the leading non-zero coefficient is positive
  const first = na !== 0 ? na : nb !== 0 ? nb : nc
  if (first < 0) {
    na = -na
    nb = -nb
    nc = -nc
  }
  return `${na},${nb},${nc}`
}

const seen = new Set<string>()
const lines: [number, number, number][] = []

for (let i = 0; i < n; i++) {
  const [a, b, c] = readline().split(" ").map(Number)
  const key = normalizeKey(a, b, c)
  if (!seen.has(key)) {
    seen.add(key)
    lines.push([a, b, c])
  }
}

// Check if either point is on a line
let onALine = false
for (const [a, b, c] of lines) {
  const valA = a * xA + b * yA + c
  const valB = a * xB + b * yB + c
  if (valA === 0 || valB === 0) {
    onALine = true
    break
  }
}

if (onALine) {
  console.log("ON A LINE")
} else {
  // Count how many lines separate A from B (A and B are on opposite sides)
  let separatingCount = 0
  for (const [a, b, c] of lines) {
    const valA = a * xA + b * yA + c
    const valB = a * xB + b * yB + c
    // If signs differ, the line separates A and B
    if ((valA > 0 && valB < 0) || (valA < 0 && valB > 0)) {
      separatingCount++
    }
  }
  // If an odd number of lines separate them, they are in different regions (different colors)
  console.log(separatingCount % 2 === 0 ? "YES" : "NO")
}
