// 🎮 CodinGame Puzzle - stall-tilt
// https://www.codingame.com/training/easy/stall-tilt

const n = parseInt(readline()) // number of competitors (not counting you)
const v = parseInt(readline()) // number of bends

const speeds: number[] = []
for (let i = 0; i < n; i++) {
  speeds.push(parseInt(readline()))
}

const radii: number[] = []
for (let i = 0; i < v; i++) {
  radii.push(parseInt(readline()))
}

const g = 9.81

// A motorcycle stalls if the angle from vertical > 60°
// (i.e., angle from ground < 30°)
// tan(θ) = v² / (r * g)
// θ > 60° => tan(θ) > tan(60°) = sqrt(3)
// v² / (r * g) > sqrt(3)
// v² > sqrt(3) * r * g
// v > sqrt(sqrt(3) * r * g)

// For a given speed, find the first bend index (0-based) where it stalls, or -1 if never
function firstStallBend(speed: number): number {
  for (let i = 0; i < radii.length; i++) {
    const r = radii[i]
    const tanTheta = (speed * speed) / (r * g)
    // stall if angle from vertical > 60°, i.e., tanTheta > tan(60°) = sqrt(3)
    if (tanTheta > Math.sqrt(3)) {
      return i // stalls at bend i (0-indexed)
    }
  }
  return -1 // doesn't stall
}

// Find maximum integer speed for "you" (y) such that you don't stall at any bend
let mySpeed = 0
for (let speed = 1; speed < 10000; speed++) {
  if (firstStallBend(speed) === -1) {
    mySpeed = speed
  } else {
    break
  }
}

console.log(mySpeed)

// Build competitor list with labels a, b, c, ...
const competitors: { label: string; speed: number; stallBend: number }[] = []
for (let i = 0; i < n; i++) {
  competitors.push({
    label: String.fromCharCode(97 + i), // 'a', 'b', 'c', ...
    speed: speeds[i],
    stallBend: firstStallBend(speeds[i]),
  })
}

// Add "you" with optimal speed (never stalls)
const me = { label: "y", speed: mySpeed, stallBend: -1 }
const allRiders = [me, ...competitors]

// Ranking rules:
// - Riders who don't stall rank above those who do
// - Among non-stallers: higher speed = better rank; ties broken by label order (original order)
// - Among stallers: later stall = better rank (fell at higher bend index = better)
//   If two stall at same bend, the faster one (higher speed) is ranked better
//   Wait, re-read: "b falls at same bend as a then c first, a second, b third"
//   So if Va > Vb and they fall at same bend, a is ranked better (a second, b third)
//   This means: same stall bend => higher speed wins (a > b means a ranked before b)

// Sort: primary = stallBend descending (-1 = no stall = best = highest)
// secondary = speed descending
// For same stallBend and speed... use original order? Let's check example.
allRiders.sort((x, y) => {
  // No stall (-1) is best
  if (x.stallBend !== y.stallBend) {
    // Higher stallBend index = stalled later = worse
    // -1 means no stall = best
    // So order: -1 > (v-1) > (v-2) > ... > 0
    if (x.stallBend === -1) return -1
    if (y.stallBend === -1) return 1
    // Both stalled: stalled later (higher index) = worse rank
    // So sort ascending by stallBend: earlier stall = worse
    return y.stallBend - x.stallBend // higher bend index = fell later = better
  }
  // Same stall bend: higher speed = better
  return y.speed - x.speed
})

for (const rider of allRiders) {
  console.log(rider.label)
}
