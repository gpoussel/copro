// 🎮 CodinGame Puzzle - binary-neural-network---part-1
// https://www.codingame.com/training/hard/binary-neural-network---part-1

// Straight simulation: fully connected sigmoid layers with a bias link,
// weights drawn from the LCG in the specified order, then per-example
// backpropagation (all deltas computed before any weight is updated).
const [nIn, nOut, nHidden, nTests, nExamples, iterations] = readline().split(" ").map(Number)
const hiddenLine = readline().trim()
const hidden = nHidden > 0 ? hiddenLine.split(/\s+/).map(Number) : []
const tests: number[][] = []
for (let i = 0; i < nTests; i++) tests.push([...readline().trim()].map(Number))
const examples: { input: number[]; expected: number[] }[] = []
for (let i = 0; i < nExamples; i++) {
  const [a, b] = readline().trim().split(/\s+/)
  examples.push({ input: [...a].map(Number), expected: [...b].map(Number) })
}

const sizes = [nIn, ...hidden, nOut]
const ETA = 0.5

let seed = 1103527590
// The first weight uses X(0) itself
const rand = (): number => {
  const v = seed / 0x7fffffff
  seed = (Math.imul(1103515245, seed) + 12345) & 0x7fffffff
  return v
}

// weights[l][k][j]: link from node j of layer l to node k of layer l+1; j = size is the bias
const weights: number[][][] = []
for (let l = 0; l + 1 < sizes.length; l++) {
  const layer: number[][] = []
  for (let k = 0; k < sizes[l + 1]; k++) {
    const row: number[] = []
    for (let j = 0; j <= sizes[l]; j++) row.push(rand())
    layer.push(row)
  }
  weights.push(layer)
}

const forward = (input: number[]): number[][] => {
  const outs = [input]
  for (let l = 0; l < weights.length; l++) {
    const prev = outs[l]
    outs.push(
      weights[l].map(row => {
        let s = row[prev.length]
        for (let j = 0; j < prev.length; j++) s += prev[j] * row[j]
        return 1 / (1 + Math.exp(-s))
      })
    )
  }
  return outs
}

for (let it = 0; it < iterations; it++) {
  for (const { input, expected } of examples) {
    const outs = forward(input)
    const deltas: number[][] = new Array<number[]>(sizes.length)
    const last = sizes.length - 1
    deltas[last] = outs[last].map((o, k) => o * (1 - o) * (o - expected[k]))
    for (let l = last - 1; l >= 1; l--) {
      deltas[l] = outs[l].map((o, j) => {
        let s = 0
        for (let k = 0; k < sizes[l + 1]; k++) s += deltas[l + 1][k] * weights[l][k][j]
        return o * (1 - o) * s
      })
    }
    for (let l = 0; l < weights.length; l++) {
      weights[l].forEach((row, k) => {
        const d = deltas[l + 1][k]
        for (let j = 0; j < sizes[l]; j++) row[j] -= ETA * d * outs[l][j]
        row[sizes[l]] -= ETA * d
      })
    }
  }
}

console.log(
  tests
    .map(t =>
      forward(t)
        [sizes.length - 1].map(o => (o >= 0.5 ? 1 : 0))
        .join("")
    )
    .join("\n")
)
