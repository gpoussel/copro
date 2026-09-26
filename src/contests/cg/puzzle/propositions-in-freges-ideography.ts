// 🎮 CodinGame Puzzle - propositions-in-freges-ideography
// https://www.codingame.com/training/medium/propositions-in-freges-ideography

const n = parseInt(readline())
const lines: string[] = []
for (let i = 0; i < n; i++) lines.push(readline())
const at = (r: number, c: number) => (r < n && c < lines[r].length ? lines[r][c] : " ")

const letters: string[] = []
for (const line of lines)
  for (const ch of line) if (ch >= "A" && ch <= "Z" && letters.indexOf(ch) < 0) letters.push(ch)
letters.sort()

// Value of the content stroke that starts at (r, c) and goes right until its letter.
// A branch hanging below column c is a condition: condition implies (rest of the stroke).
const evaluate = (r: number, c: number, values: { [l: string]: boolean }): boolean => {
  const ch = at(r, c)
  if (ch === " ") return values[at(r, c + 1)]
  let value = evaluate(r, c + 1, values)
  const below = at(r + 1, c)
  if (below === "|" || below === "'") {
    let k = r + 1
    while (at(k, c) !== "'") k++
    value = !evaluate(k, c + 1, values) || value
  }
  return ch === "+" ? !value : value
}

const falseCases: string[] = []
for (let mask = 0; mask < 1 << letters.length; mask++) {
  const values: { [l: string]: boolean } = {}
  letters.forEach((l, i) => (values[l] = ((mask >> (letters.length - 1 - i)) & 1) === 1))
  if (!evaluate(0, 0, values)) falseCases.push(letters.map(l => `${l} ${values[l] ? "True" : "False"}`).join(" "))
}
console.log(falseCases.length === 0 ? "TAUTOLOGY" : falseCases.join("\n"))
