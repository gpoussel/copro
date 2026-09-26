// 🎮 CodinGame Puzzle - depot-organization
// https://www.codingame.com/training/medium/depot-organization
//
// Wall positions around a hexagon, clockwise: 0 right, 1 bottom-right, 2 bottom-left,
// 3 left, 4 top-left, 5 top-right. A depot with rotation r shows walls[(p + r) % 6] at position p.
// The neighbour of the centre in direction d touches it with its wall (d + 3) % 6, and the
// neighbours in directions d and d + 1 touch each other with walls (d + 2) and (d + 5).

const depots: string[][] = []
for (let i = 0; i < 7; i++) depots.push(readline().trim().split(/\s+/))

function wallAt(depot: number, rotation: number, position: number): string {
  return depots[depot][(position + rotation) % 6]
}

const placedDepot: number[] = new Array(6).fill(-1)
const placedRotation: number[] = new Array(6).fill(0)
const used: boolean[] = new Array(7).fill(false)
let centreDepot = -1
let centreRotation = 0

function placeRing(direction: number): boolean {
  if (direction === 6) {
    // Close the ring between directions 5 and 0
    return wallAt(placedDepot[5], placedRotation[5], 1) === wallAt(placedDepot[0], placedRotation[0], 4)
  }
  const needed = wallAt(centreDepot, centreRotation, direction)
  for (let depot = 0; depot < 7; depot++) {
    if (used[depot]) continue
    for (let rotation = 0; rotation < 6; rotation++) {
      if (wallAt(depot, rotation, (direction + 3) % 6) !== needed) continue
      if (direction > 0) {
        const prev = direction - 1
        if (wallAt(placedDepot[prev], placedRotation[prev], (prev + 2) % 6) !== wallAt(depot, rotation, (prev + 5) % 6)) continue
      }
      used[depot] = true
      placedDepot[direction] = depot
      placedRotation[direction] = rotation
      if (placeRing(direction + 1)) return true
      used[depot] = false
    }
  }
  return false
}

let solved = false
for (let centre = 0; centre < 7 && !solved; centre++) {
  const lowest = depots[centre].slice().sort()[0]
  centreDepot = centre
  centreRotation = depots[centre].indexOf(lowest)
  used[centre] = true
  solved = placeRing(0)
  used[centre] = false
}

// Output order: top-left, top-right, left, centre, right, bottom-left, bottom-right
const describe = (depot: number, rotation: number): string => depot + wallAt(depot, rotation, 0)
const outputOrder = [4, 5, 3, -1, 0, 2, 1]
console.log(
  outputOrder
    .map((d) => (d < 0 ? describe(centreDepot, centreRotation) : describe(placedDepot[d], placedRotation[d])))
    .join(" "),
)
