// 🎮 CodinGame Puzzle - 111-rubiks-cube-movements
// https://www.codingame.com/training/easy/111-rubiks-cube-movements

// Track where each face ends up after a sequence of rotations.
// state[face] = current direction that face is pointing to.
//
// Rotation cycles (each entry a->b means direction 'a' maps to direction 'b'):
//   x  (clockwise from right):  F->U->B->D->F  (L,R unchanged)
//   y  (clockwise from top):    F->L->B->R->F  (U,D unchanged)
//   z  (clockwise from front):  U->R->D->L->U  (F,B unchanged)
// Primed (x', y', z') are the reverse cycles.

const rotations_line = readline()
const face1 = readline()
const face2 = readline()

const rotations = rotations_line.trim().split(/\s+/)

// State: maps each face label to the direction it currently faces (identity initially)
const state: Record<string, string> = {
  F: "F",
  B: "B",
  U: "U",
  D: "D",
  L: "L",
  R: "R",
}

const ROTATION_CYCLES: Record<string, string[]> = {
  x: ["F", "U", "B", "D"],
  "x'": ["F", "D", "B", "U"],
  y: ["F", "L", "B", "R"],
  "y'": ["F", "R", "B", "L"],
  z: ["U", "R", "D", "L"],
  "z'": ["U", "L", "D", "R"],
}

function applyRotation(rot: string): void {
  const cycle = ROTATION_CYCLES[rot]
  if (!cycle) return

  // Build direction map: old direction -> new direction
  const dirMap: Record<string, string> = {}
  for (let i = 0; i < cycle.length; i++) {
    dirMap[cycle[i]] = cycle[(i + 1) % cycle.length]
  }

  // Update each face's current direction
  const newState = { ...state }
  for (const face of Object.keys(state)) {
    if (dirMap[state[face]] !== undefined) {
      newState[face] = dirMap[state[face]]
    }
  }
  Object.assign(state, newState)
}

for (const rot of rotations) {
  applyRotation(rot)
}

// Output where face1 and face2 are now pointing
console.log(state[face1])
console.log(state[face2])
