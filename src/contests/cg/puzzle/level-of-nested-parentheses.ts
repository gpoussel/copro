// 🎮 CodinGame Puzzle - level-of-nested-parentheses
// https://www.codingame.com/training/medium/level-of-nested-parentheses

const f = readline()
const n = f.length

interface Pair {
  open: number
  close: number
  level: number
  height: number // 1 for a pair without nested pairs
}

// Match parentheses; a pair's height is known when it closes
const pairs: Pair[] = []
const stack: { open: number; height: number }[] = []
for (let i = 0; i < n; i++) {
  if (f[i] === "(") {
    stack.push({ open: i, height: 0 })
  } else if (f[i] === ")") {
    const top = stack.pop()!
    const height = top.height + 1
    pairs.push({ open: top.open, close: i, level: stack.length + 1, height })
    if (stack.length > 0) stack[stack.length - 1].height = Math.max(stack[stack.length - 1].height, height)
  }
}

const maxLevel = pairs.reduce((m, p) => Math.max(m, p.height), 0)
const out: string[][] = []
if (maxLevel > 0) for (let r = 0; r < maxLevel + 2; r++) out.push(new Array(n).fill(" "))
for (const p of pairs) {
  const numberRow = p.height + 1
  out[0][p.open] = out[0][p.close] = "^"
  for (let r = 1; r < numberRow; r++) out[r][p.open] = out[r][p.close] = "|"
  for (let c = p.open + 1; c < p.close; c++) out[numberRow][c] = "-"
  out[numberRow][p.open] = out[numberRow][p.close] = String(p.level)
}

console.log(f)
for (const row of out) console.log(row.join(""))
