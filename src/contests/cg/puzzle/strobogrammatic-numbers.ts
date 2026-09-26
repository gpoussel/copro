// 🎮 CodinGame Puzzle - strobogrammatic-numbers
// https://www.codingame.com/training/hard/strobogrammatic-numbers

// countUpTo(X) = strobogrammatic numbers in [0, X]. Shorter lengths are
// counted in closed form; for X's own length we walk the free left half digit
// by digit: a smaller digit frees all completions, an equal one stays tight,
// and the fully tight candidate is compared as a whole at the end.
const low = readline().trim()
const high = readline().trim()

const MIRROR: Record<string, string> = { "0": "0", "1": "1", "6": "9", "8": "8", "9": "6" }
const PAIR_DIGITS = ["0", "1", "6", "8", "9"]
const SELF_DIGITS = ["0", "1", "8"]

// Number of strobogrammatic numbers of exactly `len` digits
const full = (len: number): number => {
  if (len === 1) return 3
  const pairs = Math.floor(len / 2)
  return 4 * 5 ** (pairs - 1) * (len % 2 ? 3 : 1)
}

const isStrobo = (s: string): boolean => {
  for (let i = 0; i < s.length; i++) if (MIRROR[s[i]] !== s[s.length - 1 - i]) return false
  return true
}

const countUpTo = (x: string): number => {
  const len = x.length
  let total = 0
  for (let l = 1; l < len; l++) total += full(l)
  const half = Math.floor(len / 2)
  const hasMid = len % 2 === 1
  const prefix: string[] = []
  for (let i = 0; i < half + (hasMid ? 1 : 0); i++) {
    const isMid = i === half
    const choices = isMid ? SELF_DIGITS : PAIR_DIGITS
    // completions left after fixing position i
    const rest = 5 ** (half - i - (isMid ? 0 : 1)) * (hasMid && !isMid ? 3 : 1)
    for (const d of choices) {
      if (i === 0 && d === "0" && len > 1) continue
      if (d < x[i]) total += isMid ? 1 : rest
    }
    if (!choices.includes(x[i]) || (i === 0 && x[i] === "0" && len > 1)) return total
    prefix.push(x[i])
  }
  // Fully tight candidate: mirror the chosen half
  const left = prefix.slice(0, half)
  const candidate =
    prefix.join("") +
    left
      .reverse()
      .map(d => MIRROR[d])
      .join("")
  if (candidate <= x) total++
  return total
}

console.log(countUpTo(high) - countUpTo(low) + (isStrobo(low) ? 1 : 0))
