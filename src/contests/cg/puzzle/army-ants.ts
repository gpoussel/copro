// 🎮 CodinGame Puzzle - army-ants
// https://www.codingame.com/training/medium/army-ants

readline()
const s1 = readline().trim()
const s2 = readline().trim()
const t = Number(readline())

// First group walks right (reversed when facing the other), second group walks left
let ants = s1.split("").reverse().map(name => ({ name, right: true }))
ants = ants.concat(s2.split("").map(name => ({ name, right: false })))

for (let second = 0; second < t; second++) {
  // Every facing pair swaps simultaneously; pairs never overlap
  for (let i = 0; i + 1 < ants.length; i++) {
    if (ants[i].right && !ants[i + 1].right) {
      const tmp = ants[i]
      ants[i] = ants[i + 1]
      ants[i + 1] = tmp
      i++
    }
  }
}
console.log(ants.map(a => a.name).join(""))
