// 🎮 CodinGame Puzzle - a-story-to-go-in-circles
// https://www.codingame.com/training/medium/a-story-to-go-in-circles

const totalMoves = parseInt(readline())
const side = parseInt(readline())
const original: string[] = []
for (let i = 0; i < side; i++) original.push(readline().trim())
const cellCount = side * side

/** Character at (r, c) once the grid has been rotated `rotation` quarter turns clockwise. */
function charAt(rotation: number, r: number, c: number): string {
  for (let i = 0; i < rotation; i++) {
    // Clockwise: new[r][c] = old[n-1-c][r]
    const oldR = side - 1 - c
    c = r
    r = oldR
  }
  return original[r][c]
}

/** Applies the rotation symbols found at `pos` until standing on a letter. */
function settle(pos: number, rotation: number): number {
  const r = Math.floor(pos / side)
  const c = pos % side
  for (let guard = 0; guard < 8; guard++) {
    const ch = charAt(rotation, r, c)
    if (ch === "#") rotation = (rotation + 1) % 4
    else if (ch === "@") rotation = (rotation + 3) % 4
    else break
  }
  return rotation
}

// State after each move: position and grid rotation; the sequence is eventually periodic
const history: [number, number][] = []
const seen = new Map<number, number>()
let pos = 0
let rotation = settle(0, 0)
let answerState: [number, number] | null = null
for (let move = 1; move <= totalMoves; move++) {
  const key = pos * 4 + rotation
  const previous = seen.get(key)
  if (previous !== undefined) {
    const cycle = move - previous
    answerState = history[previous - 1 + ((totalMoves - previous) % cycle)]
    break
  }
  seen.set(key, move)
  history.push([pos, rotation])
  const ch = charAt(rotation, Math.floor(pos / side), pos % side)
  const step = ch.charCodeAt(0) - 96
  pos = (pos + Math.max(step, 0)) % cellCount
  rotation = settle(pos, rotation)
}
if (!answerState) answerState = history[history.length - 1]
const [finalPos, finalRotation] = answerState
console.log(charAt(finalRotation, Math.floor(finalPos / side), finalPos % side))
