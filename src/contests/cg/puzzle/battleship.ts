// 🎮 CodinGame Puzzle - battleship
// https://www.codingame.com/training/medium/battleship

const shot = readline().trim()
const grid: string[][] = []
for (let i = 0; i < 10; i++) grid.push(readline().split(""))
const shotCol = shot.charCodeAt(0) - 65
const shotRow = parseInt(shot.slice(1)) - 1

const isShip = (r: number, c: number): boolean =>
  r >= 0 && r < 10 && c >= 0 && c < 10 && (grid[r][c] === "+" || grid[r][c] === "_")

// Group ship cells with 8-connectivity: touching ships merge into a non-straight group
const shipId: number[][] = grid.map(row => row.map(() => -1))
const ships: [number, number][][] = []
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 10; c++) {
    if (!isShip(r, c) || shipId[r][c] >= 0) continue
    const cells: [number, number][] = []
    const stack: [number, number][] = [[r, c]]
    shipId[r][c] = ships.length
    while (stack.length > 0) {
      const [cr, cc] = stack.pop()!
      cells.push([cr, cc])
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = cr + dr
          const nc = cc + dc
          if (isShip(nr, nc) && shipId[nr][nc] < 0) {
            shipId[nr][nc] = ships.length
            stack.push([nr, nc])
          }
        }
      }
    }
    ships.push(cells)
  }
}

const straight = (cells: [number, number][]): boolean =>
  cells.every(([r]) => r === cells[0][0]) || cells.every(([, c]) => c === cells[0][1])
const sizes = ships.map(s => s.length).sort((a, b) => a - b)
const valid = ships.every(straight) && sizes.join(",") === "2,3,3,4,5"

const sunk = (cells: [number, number][]): boolean => cells.every(([r, c]) => grid[r][c] === "_")

if (!valid) console.log("INVALID")
else if (grid[shotRow][shotCol] !== "+") console.log("MISSED")
else {
  grid[shotRow][shotCol] = "_"
  const ship = ships[shipId[shotRow][shotCol]]
  if (!sunk(ship)) console.log("TOUCHE")
  else console.log(`TOUCHE COULE ${ship.length}` + (ships.every(sunk) ? " THEN LOSE" : ""))
}
