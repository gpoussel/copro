// 🎮 CodinGame Puzzle - insert-to-string
// https://www.codingame.com/training/easy/insert-to-string

const s: string = readline()
const changeCount: number = parseInt(readline(), 10)
const lines: string[] = s.split("\\n")
const inserts: Map<number, string>[] = lines.map(() => new Map<number, string>())
for (let i = 0; i < changeCount; i++) {
  const raw: string = readline()
  const first = raw.indexOf("|")
  const second = raw.indexOf("|", first + 1)
  const lineNum = parseInt(raw.slice(0, first), 10)
  const colNum = parseInt(raw.slice(first + 1, second), 10)
  const toAdd = raw.slice(second + 1)
  inserts[lineNum].set(colNum, toAdd)
}
const outLines: string[] = lines.map((line, idx) => {
  const map = inserts[idx]
  let res = ""
  for (let c = 0; c <= line.length; c++) {
    if (map.has(c)) res += map.get(c)
    if (c < line.length) res += line[c]
  }
  return res
})
const joined: string = outLines.join("\\n")
console.log(joined.split("\\n").join("\n"))
