// 🎮 CodinGame Puzzle - 1000000000d-world
// https://www.codingame.com/training/easy/1000000000d-world

// Parse the two compressed vectors
const parseCompressed = (line: string): [number, number][] => {
  const parts = line.trim().split(/\s+/).map(Number)
  const runs: [number, number][] = []
  for (let i = 0; i < parts.length; i += 2) {
    runs.push([parts[i], parts[i + 1]]) // [count, value]
  }
  return runs
}

const lineA = readline()
const lineB = readline()

const runsA = parseCompressed(lineA)
const runsB = parseCompressed(lineB)

// Compute dot product by iterating through both compressed vectors in sync
let dotProduct = BigInt(0)
let iA = 0
let iB = 0
let remA = BigInt(runsA[0][0])
let remB = BigInt(runsB[0][0])

while (iA < runsA.length && iB < runsB.length) {
  const valA = BigInt(runsA[iA][1])
  const valB = BigInt(runsB[iB][1])

  // Overlap is the minimum of remaining counts in both runs
  const overlap = remA < remB ? remA : remB
  dotProduct += overlap * valA * valB

  remA -= overlap
  remB -= overlap

  if (remA === BigInt(0)) {
    iA++
    if (iA < runsA.length) remA = BigInt(runsA[iA][0])
  }
  if (remB === BigInt(0)) {
    iB++
    if (iB < runsB.length) remB = BigInt(runsB[iB][0])
  }
}

console.log(dotProduct.toString())
