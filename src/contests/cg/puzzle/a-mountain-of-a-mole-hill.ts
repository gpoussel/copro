// 🎮 CodinGame Puzzle - a-mountain-of-a-mole-hill
// https://www.codingame.com/training/easy/a-mountain-of-a-mole-hill

const grid: string[] = []
for (let i = 0; i < 16; i++) {
  grid.push(readline())
}

// Fence characters that block movement between regions
const FENCE = new Set(["|", "+", "-"])

// Helper: does the cell have a vertical fence connection (upward)?
function connectsUp(r: number, c: number): boolean {
  if (r <= 0) return false
  const ch = grid[r - 1][c]
  return ch === "|" || ch === "+"
}

// Helper: does the cell have a vertical fence connection (downward)?
function connectsDown(r: number, c: number): boolean {
  if (r >= 15) return false
  const ch = grid[r + 1][c]
  return ch === "|" || ch === "+"
}

// Ray casting: cast a horizontal ray from (r, c) to the left.
// Count fence crossings using proper corner-pair logic.
// A '+' that is part of a horizontal fence segment comes in pairs.
// We handle each '+' by looking at whether it connects vertically (up or down).
// A '+' with only horizontal connections (no vertical) is not a crossing.
// A '+' with vertical connection on one side (the ray "enters" and "exits" via horizontal):
//   - Track the first corner's vertical side, then the second corner:
//     if they're on the same side (both up or both down) → 0 crossings (S-shape)
//     if they're on opposite sides (one up, one down) → 1 crossing (Z-shape)
// A '|' is always 1 crossing.
function isInsideByRayCasting(row: number, col: number): boolean {
  let crossings = 0
  let cornerEntry: string | null = null // 'up' or 'down' from first corner of a horizontal run

  for (let c = col - 1; c >= 0; c--) {
    const ch = grid[row][c]
    if (ch === "|") {
      crossings++
      cornerEntry = null
    } else if (ch === "+") {
      const up = connectsUp(row, c)
      const down = connectsDown(row, c)
      if (up && down) {
        // '+' is part of a vertical fence going through this row
        crossings++
        cornerEntry = null
      } else if (up || down) {
        // '+' is a corner connecting horizontally and vertically
        const side = up ? "up" : "down"
        if (cornerEntry === null) {
          cornerEntry = side
        } else {
          // Second corner of horizontal run
          if (cornerEntry !== side) {
            // Opposite sides → actual crossing (Z-shape)
            crossings++
          }
          // Same sides → no crossing (U-shape / S-shape)
          cornerEntry = null
        }
      }
      // If neither up nor down, it's an isolated '+' - doesn't count
    } else if (ch === "-") {
      // Horizontal fence segment - skip (part of the horizontal run being tracked)
    }
    // Non-fence characters: reset corner tracking
    else {
      cornerEntry = null
    }
  }

  return crossings % 2 === 1
}

// Step 1: Find all connected components (non-fence cells connected without crossing fences).
const regionId = Array.from({ length: 16 }, () => new Array(16).fill(-1))
const regionHasSpace: boolean[] = []
const regionHasDot: boolean[] = []
const regionRepCell: [number, number][] = []
let nextId = 0

for (let r = 0; r < 16; r++) {
  for (let c = 0; c < 16; c++) {
    if (FENCE.has(grid[r][c]) || regionId[r][c] !== -1) continue

    const id = nextId++
    regionHasSpace.push(false)
    regionHasDot.push(false)
    regionRepCell.push([r, c])
    const queue: [number, number][] = [[r, c]]
    regionId[r][c] = id

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!
      const ch = grid[cr][cc]
      if (ch === " ") regionHasSpace[id] = true
      if (ch === ".") regionHasDot[id] = true

      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const nr = cr + dr
        const nc = cc + dc
        if (nr >= 0 && nr < 16 && nc >= 0 && nc < 16 && regionId[nr][nc] === -1 && !FENCE.has(grid[nr][nc])) {
          regionId[nr][nc] = id
          queue.push([nr, nc])
        }
      }
    }
  }
}

// Step 2: Determine if each region is a garden.
const regionIsGarden: boolean[] = new Array(nextId).fill(false)
for (let id = 0; id < nextId; id++) {
  if (regionHasSpace[id]) {
    regionIsGarden[id] = true
  } else if (regionHasDot[id]) {
    regionIsGarden[id] = false
  } else {
    // All 'o' region: use ray casting on the representative cell
    const [r, c] = regionRepCell[id]
    regionIsGarden[id] = isInsideByRayCasting(r, c)
  }
}

// Step 3: Count 'o' in garden regions
let count = 0
for (let r = 0; r < 16; r++) {
  for (let c = 0; c < 16; c++) {
    if (grid[r][c] === "o") {
      const id = regionId[r][c]
      if (id !== -1 && regionIsGarden[id]) {
        count++
      }
    }
  }
}

console.log(count)
