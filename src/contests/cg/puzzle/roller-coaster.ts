// 🎮 CodinGame Puzzle - roller-coaster
// https://www.codingame.com/training/hard/roller-coaster

const first = readline().split(" ").map(Number)
const L = first[0]
const C = first[1]
const N = first[2]
const P: number[] = []
for (let i = 0; i < N; i++) P.push(parseInt(readline()))

// For each starting queue position p, precompute the gain of one ride and the
// next starting position. One ride greedily boards consecutive (circular)
// groups while they still fit in the L seats.
const gainAt: number[] = new Array(N)
const nextAt: number[] = new Array(N)
for (let p = 0; p < N; p++) {
  let cap = L
  let gain = 0
  let idx = p
  let count = 0
  while (count < N) {
    const g = P[idx]
    if (g > cap) break
    cap -= g
    gain += g
    idx = (idx + 1) % N
    count++
  }
  gainAt[p] = gain
  nextAt[p] = idx
}

// Simulate up to C rides. The state is just the starting position (0..N-1), so
// a cycle of length <= N must appear; fast-forward the remaining full cycles.
let total = 0n
let p = 0
const rides = C
const seenRideAt: number[] = new Array(N).fill(-1)
const cumGain: bigint[] = []
let ride = 0
while (ride < rides) {
  if (seenRideAt[p] !== -1) {
    const cycleStart = seenRideAt[p]
    const cycleLen = ride - cycleStart
    const cycleGain = total - cumGain[cycleStart]
    const remaining = rides - ride
    const fullCycles = BigInt(Math.floor(remaining / cycleLen))
    total += fullCycles * cycleGain
    const rem = remaining % cycleLen
    for (let i = 0; i < rem; i++) {
      total += BigInt(gainAt[p])
      p = nextAt[p]
    }
    ride = rides
    break
  }
  seenRideAt[p] = ride
  cumGain[ride] = total
  total += BigInt(gainAt[p])
  p = nextAt[p]
  ride++
}

console.log(total.toString())
