// 🎮 CodinGame Puzzle - entanglement---episode-1
// https://www.codingame.com/training/medium/entanglement---episode-1

// Entrances: 0,1 bottom; 2,3 south-east; 4,5 north-east; 6,7 top; 8,9 north-west; 10,11 south-west
const EXIT_TO_ENTRANCE = [7, 6, 9, 8, 11, 10, 1, 0, 3, 2, 5, 4]
const EXIT_TO_DIFF: [number, number][] = [
  [0, 1],
  [0, 1],
  [1, 1],
  [1, 1],
  [1, 0],
  [1, 0],
  [0, -1],
  [0, -1],
  [-1, -1],
  [-1, -1],
  [-1, 0],
  [-1, 0],
]

const cellKey = (x: number, y: number) => `${x},${y}`
const isPlayable = (x: number, y: number) =>
  Math.abs(x) <= 3 && Math.abs(y) <= 3 && Math.abs(x - y) <= 3 && !(x === 0 && y === 0)

// For each placed tile, entrance -> exit
const tiles: { [key: string]: number[] } = {}

// Leave the base tile [0,0] through exit 7
let curX = 0
let curY = -1
let curEntrance = EXIT_TO_ENTRANCE[7]
let totalScore = 0

while (true) {
  const links: number[] = new Array(12).fill(-1)
  for (let i = 0; i < 6; i++) {
    const [a, b] = readline().split(" ").map(Number)
    links[a] = b
    links[b] = a
  }
  tiles[cellKey(curX, curY)] = links

  const segments: string[] = []
  let gained = 0
  while (tiles[cellKey(curX, curY)] !== undefined) {
    const exit = tiles[cellKey(curX, curY)][curEntrance]
    segments.push(`${curX} ${curY} ${curEntrance} ${exit}`)
    totalScore += ++gained
    const [dx, dy] = EXIT_TO_DIFF[exit]
    curX += dx
    curY += dy
    curEntrance = EXIT_TO_ENTRANCE[exit]
    // Stop at the board edge or when coming back to the base tile
    if (!isPlayable(curX, curY)) break
  }

  console.log(totalScore)
  console.log(segments.join(";"))
}
