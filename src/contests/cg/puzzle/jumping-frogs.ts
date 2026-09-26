// 🎮 CodinGame Puzzle - jumping-frogs
// https://www.codingame.com/training/medium/jumping-frogs

const frogs: number[][] = []
for (let i = 0; i < 3; i++) frogs.push(readline().trim().split(/\s+/).map(Number))

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

// Each coordinate is independent: frog i reaches exactly the values congruent to its start mod k_i.
// A system of congruences has a solution iff every pair agrees modulo gcd of their moduli.
const compatible = (axis: number) => {
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const g = gcd(frogs[i][2], frogs[j][2])
      if ((frogs[i][axis] - frogs[j][axis]) % g !== 0) return false
    }
  }
  return true
}

console.log(compatible(0) && compatible(1) ? "Possible" : "Impossible")
