// 🎮 CodinGame Puzzle - holey-times
// https://www.codingame.com/training/medium/holey-times

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline().replace(/\s+$/, ""))

// Layout: operand, "x operand", dashes, one partial line per digit of B, dashes, result
const patternA = lines[0].trim()
const patternB = lines[1].replace("x", "").trim()
const partialPatterns = lines.slice(3, n - 2).map(s => s.trim())
const resultPattern = lines[n - 1].trim()

const matches = (pattern: string, value: string): boolean => {
  if (pattern.length !== value.length) return false
  for (let i = 0; i < pattern.length; i++) if (pattern[i] !== "*" && pattern[i] !== value[i]) return false
  return true
}

// All numbers without leading zero that fit a pattern
const candidates = (pattern: string): number[] => {
  const out: number[] = []
  const low = pattern.length === 1 ? 0 : 10 ** (pattern.length - 1)
  for (let v = low; v < 10 ** pattern.length; v++) if (matches(pattern, String(v))) out.push(v)
  return out
}

const partialLine = (a: number, digit: number, shift: number): string => {
  let s = String(a * digit)
  for (let k = 0; k < shift; k++) s += "0"
  return s
}

const as = candidates(patternA)
let solution: string[] | null = null
for (const b of candidates(patternB)) {
  const digits = String(b).split("").reverse().map(Number)
  for (const a of as) {
    const partials = digits.map((d, i) => partialLine(a, d, i))
    if (!partials.every((p, i) => matches(partialPatterns[i], p))) continue
    if (!matches(resultPattern, String(a * b))) continue
    solution = [String(a), String(b)].concat(partials, [String(a * b)])
    break
  }
  if (solution) break
}

// Rewrite each line keeping its original right alignment
const fill = (line: string, value: string): string => line.slice(0, line.length - value.length) + value
const [a, b] = solution!
const out = [fill(lines[0], a), fill(lines[1], b), lines[2]]
for (let i = 0; i < partialPatterns.length; i++) out.push(fill(lines[3 + i], solution![2 + i]))
out.push(lines[n - 2], fill(lines[n - 1], solution![solution!.length - 1]))
console.log(out.join("\n"))
