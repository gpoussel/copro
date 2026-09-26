// 🎮 CodinGame Puzzle - the-holy-grail
// https://www.codingame.com/training/hard/the-holy-grail

// Union-find over revealed tiles: stop as soon as start and grail are joined.

const [roomW, roomH] = readline().split(" ").map(Number)
const tileCount = Number(readline())

const parent = Array.from({ length: roomW * roomH }, (_, i) => i)
const visible = new Array<boolean>(roomW * roomH).fill(false)
const find = (v: number): number => {
  while (parent[v] !== v) {
    parent[v] = parent[parent[v]]
    v = parent[v]
  }
  return v
}
const reveal = (x: number, y: number): void => {
  const c = y * roomW + x
  visible[c] = true
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= roomW || ny >= roomH || !visible[ny * roomW + nx]) continue
    parent[find(ny * roomW + nx)] = find(c)
  }
}

const grail = roomW * roomH - 1
reveal(0, 0)
reveal(roomW - 1, roomH - 1)
let answer = 0
for (let i = 1; i <= tileCount; i++) {
  const [x, y] = readline().split(" ").map(Number)
  if (answer) continue
  reveal(x, y)
  if (find(0) === find(grail)) answer = i
}
console.log(answer)
