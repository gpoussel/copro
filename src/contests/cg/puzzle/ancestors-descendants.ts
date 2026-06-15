// 🎮 CodinGame Puzzle - ancestors-descendants
// https://www.codingame.com/training/medium/ancestors-descendants

const n: number = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())

const depth = (s: string): number => {
  let d = 0
  while (d < s.length && s[d] === ".") d++
  return d
}

const stack: string[] = []
const out: string[] = []
for (let i = 0; i < n; i++) {
  const d = depth(lines[i])
  const name = lines[i].slice(d)
  stack.length = d
  stack.push(name)
  const isLeaf = i === n - 1 || depth(lines[i + 1]) <= d
  if (isLeaf) out.push(stack.join(" > "))
}
console.log(out.join("\n"))
