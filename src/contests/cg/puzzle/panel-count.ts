// 🎮 CodinGame Puzzle - panel-count
// https://www.codingame.com/training/easy/panel-count

const P: number = parseInt(readline(), 10)
const props: string[] = []
for (let i = 0; i < P; i++) props.push(readline())

const N: number = parseInt(readline(), 10)
const persons: Map<string, string>[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  const m = new Map<string, string>()
  for (let j = 0; j < P; j++) m.set(props[j], parts[j + 1])
  persons.push(m)
}

const F: number = parseInt(readline(), 10)
const out: string[] = []
for (let i = 0; i < F; i++) {
  const formula = readline()
  const conds = formula.split(" AND ").map(c => {
    const eq = c.indexOf("=")
    return [c.slice(0, eq), c.slice(eq + 1)] as [string, string]
  })
  let count = 0
  for (const p of persons) {
    let ok = true
    for (const [k, v] of conds) {
      if (p.get(k) !== v) {
        ok = false
        break
      }
    }
    if (ok) count++
  }
  out.push(String(count))
}
console.log(out.join("\n"))
