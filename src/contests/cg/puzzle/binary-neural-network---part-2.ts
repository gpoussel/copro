// 🎮 CodinGame Puzzle - binary-neural-network---part-2
// https://www.codingame.com/training/expert/binary-neural-network---part-2

// One sigmoid network (8 -> 32 -> 8) trained by plain per-example backpropagation on the
// training sets, then thresholded at 0.5. Weights come from a seeded LCG so runs are stable.
const [nTests, nSets]: number[] = readline().split(" ").map(Number)
const testIn: number[][] = []
for (let i = 0; i < nTests; i++) testIn.push([...readline().trim()].map(Number))
const trainIn: number[][] = []
const trainOut: number[][] = []
for (let i = 0; i < nSets; i++) {
  const [a, b] = readline().trim().split(/\s+/)
  trainIn.push([...a].map(Number))
  trainOut.push([...b].map(Number))
}

const HIDDEN: number = 32
const EPOCHS: number = 1000
const ETA: number = 0.3

let seed: number = 12345
const rand = (): number => {
  seed = (Math.imul(1103515245, seed) + 12345) & 0x7fffffff
  return (seed / 0x7fffffff) * 2 - 1
}

// w1[h][i] (i = 8 is bias), w2[o][h] (h = HIDDEN is bias)
const w1: Float64Array[] = []
for (let h = 0; h < HIDDEN; h++) w1.push(Float64Array.from({ length: 9 }, () => rand()))
const w2: Float64Array[] = []
for (let o = 0; o < 8; o++) w2.push(Float64Array.from({ length: HIDDEN + 1 }, () => rand() * 0.5))

const sig = (x: number): number => 1 / (1 + Math.exp(-x))
const hid: Float64Array = new Float64Array(HIDDEN)
const out: Float64Array = new Float64Array(8)
const dHid: Float64Array = new Float64Array(HIDDEN)
const dOut: Float64Array = new Float64Array(8)

const forwardPass = (x: number[]): void => {
  for (let h = 0; h < HIDDEN; h++) {
    const w: Float64Array = w1[h]
    let s: number = w[8]
    for (let i = 0; i < 8; i++) s += w[i] * x[i]
    hid[h] = sig(s)
  }
  for (let o = 0; o < 8; o++) {
    const w: Float64Array = w2[o]
    let s: number = w[HIDDEN]
    for (let h = 0; h < HIDDEN; h++) s += w[h] * hid[h]
    out[o] = sig(s)
  }
}

for (let ep = 0; ep < EPOCHS; ep++) {
  for (let n = 0; n < nSets; n++) {
    const x: number[] = trainIn[n]
    const y: number[] = trainOut[n]
    forwardPass(x)
    // cross-entropy loss with sigmoid output: delta = out - target
    for (let o = 0; o < 8; o++) dOut[o] = out[o] - y[o]
    for (let h = 0; h < HIDDEN; h++) {
      let s: number = 0
      for (let o = 0; o < 8; o++) s += dOut[o] * w2[o][h]
      dHid[h] = s * hid[h] * (1 - hid[h])
    }
    for (let o = 0; o < 8; o++) {
      const w: Float64Array = w2[o]
      const d: number = ETA * dOut[o]
      for (let h = 0; h < HIDDEN; h++) w[h] -= d * hid[h]
      w[HIDDEN] -= d
    }
    for (let h = 0; h < HIDDEN; h++) {
      const w: Float64Array = w1[h]
      const d: number = ETA * dHid[h]
      for (let i = 0; i < 8; i++) w[i] -= d * x[i]
      w[8] -= d
    }
  }
}

const lines: string[] = []
for (const x of testIn) {
  forwardPass(x)
  lines.push(Array.from(out, (v: number) => (v >= 0.5 ? "1" : "0")).join(""))
}
console.log(lines.join("\n"))
