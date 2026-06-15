// 🎮 CodinGame Puzzle - simple-diff-tool
// https://www.codingame.com/

const mode: string = readline()
const n1: number = parseInt(readline(), 10)
const v1: string[] = []
for (let i = 0; i < n1; i++) v1.push(readline())
const n2: number = parseInt(readline(), 10)
const v2: string[] = []
for (let i = 0; i < n2; i++) v2.push(readline())

const diffs: string[] = []

if (mode === "BY_NUMBER") {
  const max: number = Math.max(n1, n2)
  for (let i = 0; i < max; i++) {
    const a: string | undefined = i < n1 ? v1[i] : undefined
    const b: string | undefined = i < n2 ? v2[i] : undefined
    if (a !== undefined && b !== undefined) {
      if (a !== b) diffs.push(`CHANGE: ${a} ---> ${b}`)
    } else if (a !== undefined) {
      diffs.push(`DELETE: ${a}`)
    } else if (b !== undefined) {
      diffs.push(`ADD: ${b}`)
    }
  }
} else {
  const pos2: Map<string, number> = new Map<string, number>()
  for (let i = 0; i < n2; i++) pos2.set(v2[i], i)
  const set1: Set<string> = new Set<string>(v1)
  for (let i = 0; i < n1; i++) {
    const line: string = v1[i]
    if (pos2.has(line)) {
      const j: number = pos2.get(line) as number
      if (i !== j) diffs.push(`MOVE: ${line} @:${i + 1} >>> @:${j + 1}`)
    } else {
      diffs.push(`DELETE: ${line}`)
    }
  }
  for (let j = 0; j < n2; j++) {
    if (!set1.has(v2[j])) diffs.push(`ADD: ${v2[j]}`)
  }
}

if (diffs.length === 0) {
  console.log("No Diffs")
} else {
  diffs.sort()
  for (const d of diffs) console.log(d)
}
