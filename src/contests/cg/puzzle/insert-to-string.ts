// 🎮 CodinGame Puzzle - insert-to-string
// https://www.codingame.com/training/easy/insert-to-string

const s: string = readline()
const changeCount: number = parseInt(readline(), 10)

// Split the original string into lines on the literal "\n" markers.
const lines: string[] = s.split("\\n")

// For each line, collect inserts as { col, text }.
const inserts: { col: number; text: string }[][] = lines.map(() => [] as { col: number; text: string }[])

for (let i = 0; i < changeCount; i++) {
  const rawChange: string = readline()
  const first: number = rawChange.indexOf("|")
  const second: number = rawChange.indexOf("|", first + 1)
  const lineNum: number = parseInt(rawChange.slice(0, first), 10)
  const colNum: number = parseInt(rawChange.slice(first + 1, second), 10)
  const toAdd: string = rawChange.slice(second + 1)
  inserts[lineNum].push({ col: colNum, text: toAdd })
}

const resultLines: string[] = lines.map((line, idx) => {
  const lineInserts: { col: number; text: string }[] = inserts[idx]
  lineInserts.sort((a, b) => a.col - b.col)
  let out: string = ""
  let prev: number = 0
  for (const ins of lineInserts) {
    out += line.slice(prev, ins.col) + ins.text
    prev = ins.col
  }
  out += line.slice(prev)
  return out
})

// Re-join lines with the "\n" marker, then turn every "\n" into a real newline.
const joined: string = resultLines.join("\\n")
console.log(joined.split("\\n").join("\n"))
