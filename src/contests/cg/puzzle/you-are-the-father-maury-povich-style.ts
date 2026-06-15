// 🎮 CodinGame Puzzle - you-are-the-father-maury-povich-style
// https://www.codingame.com/training/easy/you-are-the-father-maury-povich-style

const parsePairs = (line: string): string[] => {
  const idx = line.indexOf(":")
  return line
    .slice(idx + 1)
    .trim()
    .split(/\s+/)
}
const nameOf = (line: string): string => {
  const idx = line.indexOf(":")
  const before = line.slice(0, idx).trim().split(/\s+/)
  return before[before.length - 1]
}

const motherLine = readline()
const childLine = readline()
const mother = parsePairs(motherLine)
const child = parsePairs(childLine)
const n = parseInt(readline(), 10)

const fits = (parentPairs: string[]): boolean => {
  for (let i = 0; i < child.length; i++) {
    const c = child[i]
    const m = mother[i]
    const p = parentPairs[i]
    const a = c[0]
    const b = c[1]
    const ok = (m.includes(a) && p.includes(b)) || (m.includes(b) && p.includes(a))
    if (!ok) return false
  }
  return true
}

for (let i = 0; i < n; i++) {
  const line = readline()
  const pairs = parsePairs(line)
  if (fits(pairs)) {
    console.log(`${nameOf(line)}, you are the father!`)
    break
  }
}
