// 🎮 CodinGame Puzzle - panel-count
// https://www.codingame.com/training/easy/panel-count

const p: number = parseInt(readline(), 10)
const properties: string[] = []
for (let i = 0; i < p; i++) {
  properties.push(readline())
}

const index: Map<string, number> = new Map<string, number>()
for (let i = 0; i < properties.length; i++) {
  index.set(properties[i], i)
}

const n: number = parseInt(readline(), 10)
const persons: string[][] = []
for (let i = 0; i < n; i++) {
  const tokens: string[] = readline().split(" ")
  persons.push(tokens.slice(1))
}

const f: number = parseInt(readline(), 10)
const output: string[] = []
for (let i = 0; i < f; i++) {
  const clauses: string[] = readline().split(" AND ")
  const constraints: Array<[number, string]> = []
  let valid: boolean = true
  for (const clause of clauses) {
    const eq: number = clause.indexOf("=")
    const name: string = clause.slice(0, eq)
    const value: string = clause.slice(eq + 1)
    const idx: number | undefined = index.get(name)
    if (idx === undefined) {
      valid = false
      break
    }
    constraints.push([idx, value])
  }

  let count: number = 0
  if (valid) {
    for (const person of persons) {
      let match: boolean = true
      for (const [idx, value] of constraints) {
        if (person[idx] !== value) {
          match = false
          break
        }
      }
      if (match) {
        count++
      }
    }
  }
  output.push(String(count))
}

console.log(output.join("\n"))
