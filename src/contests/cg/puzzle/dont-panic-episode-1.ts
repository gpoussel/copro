// 🎮 CodinGame Puzzle - dont-panic-episode-1
// https://www.codingame.com/training/medium/don't-panic-episode-1

// Read initialization data
const initLine = readline().split(" ").map(Number)
const exitFloor = initLine[3]
const exitPos = initLine[4]
const nbElevators = initLine[7]

// Map: floor -> elevator position on that floor
// (at most one elevator per floor in episode 1)
const elevators: Map<number, number> = new Map()

for (let i = 0; i < nbElevators; i++) {
  const parts = readline().split(" ").map(Number)
  const elevatorFloor = parts[0]
  const elevatorPos = parts[1]
  elevators.set(elevatorFloor, elevatorPos)
}

// Game loop
while (true) {
  const parts = readline().split(" ")
  const cloneFloor = parseInt(parts[0])
  const clonePos = parseInt(parts[1])
  const direction = parts[2] // "LEFT", "RIGHT", or "NONE"

  // If no leading clone is active yet, just wait
  if (direction === "NONE" || cloneFloor === -1) {
    console.log("WAIT")
    continue
  }

  // Determine where we need the clone to go on this floor.
  // On the exit floor, we need to reach exitPos.
  // On any other floor, we need to reach the elevator on this floor.
  let targetPos: number

  if (cloneFloor === exitFloor) {
    targetPos = exitPos
  } else if (elevators.has(cloneFloor)) {
    targetPos = elevators.get(cloneFloor)!
  } else {
    // No elevator on this floor and not the exit floor.
    // This shouldn't happen in a solvable puzzle, but wait to be safe.
    console.log("WAIT")
    continue
  }

  // Determine the required direction to reach the target
  const requiredDirection = targetPos > clonePos ? "RIGHT" : targetPos < clonePos ? "LEFT" : direction

  // If the clone is already at the target position (on an elevator or exit), wait
  if (clonePos === targetPos) {
    console.log("WAIT")
    continue
  }

  // If the clone is heading in the wrong direction, block it.
  // The next clone will have reversed direction (due to blocked clone) and head correctly.
  if (direction !== requiredDirection) {
    console.log("BLOCK")
  } else {
    console.log("WAIT")
  }
}
