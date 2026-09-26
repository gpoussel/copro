// 🎮 CodinGame Puzzle - queneau-numbers
// https://www.codingame.com/training/medium/queneau-numbers

const queneauN = parseInt(readline(), 10)

// Spiral permutation: take alternately from the end and from the start
function spiral(seq: number[]): number[] {
  const out: number[] = []
  let lo = 0
  let hi = seq.length - 1
  while (lo <= hi) {
    out.push(seq[hi--])
    if (lo <= hi) out.push(seq[lo++])
  }
  return out
}

let sequence: number[] = []
for (let i = 1; i <= queneauN; i++) sequence.push(i)
const initial = sequence.join(",")
const steps: string[] = []
for (let i = 0; i < queneauN; i++) {
  sequence = spiral(sequence)
  steps.push(sequence.join(","))
}
console.log(steps[queneauN - 1] === initial ? steps.join("\n") : "IMPOSSIBLE")
