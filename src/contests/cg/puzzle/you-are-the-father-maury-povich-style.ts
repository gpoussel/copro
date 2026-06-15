// 🎮 CodinGame Puzzle - you-are-the-father-maury-povich-style
// https://www.codingame.com/training/easy/you-are-the-father-maury-povich-style

function parse(line: string): { name: string; pairs: string[] } {
  const idx: number = line.indexOf(":")
  const name: string = line.slice(0, idx)
  const pairs: string[] = line
    .slice(idx + 1)
    .trim()
    .split(/\s+/)
  return { name, pairs }
}

const mother = parse(readline())
const child = parse(readline())
const n: number = parseInt(readline(), 10)

function fits(c: string, m: string, f: string): boolean {
  const a: string = c[0]
  const b: string = c[1]
  if (m.includes(a) && f.includes(b)) return true
  if (m.includes(b) && f.includes(a)) return true
  return false
}

let answer: string = ""
for (let i = 0; i < n; i++) {
  const father = parse(readline())
  let ok: boolean = true
  for (let j = 0; j < child.pairs.length; j++) {
    if (!fits(child.pairs[j], mother.pairs[j], father.pairs[j])) {
      ok = false
      break
    }
  }
  if (ok) answer = father.name
}

console.log(`${answer}, you are the father!`)
