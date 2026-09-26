// 🎮 CodinGame Puzzle - optical-link-failure-localization
// https://www.codingame.com/training/medium/optical-link-failure-localization

const links = parseInt(readline())
readline() // mtrails
const failures = parseInt(readline())
const alarm = parseInt(readline(), 2)
const codes: number[] = []
for (let i = 0; i < links; i++) codes.push(parseInt(readline(), 2))

// Every failure set of size 1..failures produces the OR of its link codes
const candidates: number[][] = []
for (let i = 0; i < links; i++) {
  if (codes[i] === alarm) candidates.push([i])
  if (failures < 2) continue
  for (let j = i + 1; j < links; j++) {
    if ((codes[i] | codes[j]) === alarm) candidates.push([i, j])
  }
}

console.log(candidates.length === 1 ? candidates[0].join(" ") : "AMBIGUOUS")
