// 🎮 CodinGame Puzzle - horn-sat-solver
// https://www.codingame.com/training/hard/horn-sat-solver

// Forward chaining on the minimal model: start with every variable false and
// repeatedly fire clauses whose whole body is true. A clause with a head sets
// it to true; a clause without head (all negative, or empty) whose body is
// true is violated, so the formula is unsatisfiable.
const [, , V, C] = readline().split(" ")
const nVars = Number(V)
const clauses: { head: number; body: number[] }[] = []
for (let i = 0; i < Number(C); i++) {
  const lits = readline()
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter(x => x !== 0)
  clauses.push({ head: lits.find(x => x > 0) ?? 0, body: lits.filter(x => x < 0).map(x => -x) })
}

const value = new Array<boolean>(nVars + 1).fill(false)
let sat = true
let changed = true
while (changed && sat) {
  changed = false
  for (const { head, body } of clauses) {
    if (!body.every(v => value[v])) continue
    if (head === 0) {
      sat = false
      break
    }
    if (!value[head]) {
      value[head] = true
      changed = true
    }
  }
}

if (!sat) console.log("s UNSATISFIABLE")
else {
  console.log("s SATISFIABLE")
  const vals: string[] = []
  for (let v = 1; v <= nVars; v++) vals.push(String(value[v] ? v : -v))
  console.log(`v ${vals.join(" ")} 0`)
}
