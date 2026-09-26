// 🎮 CodinGame Puzzle - inertia-ride
// https://www.codingame.com/training/hard/inertia-ride

// Straight simulation: one track char per column. Each turn the inertia changes
// with the slope as seen in the current direction, a negative value flips the
// direction, zero inertia on a flat track stops the wagon, otherwise it moves one
// column. Reaching either end stops it.

let inertia = parseInt(readline())
const [w, h] = readline().split(" ").map(Number)
const rows: string[] = []
for (let i = 0; i < h; i++) rows.push(readline())
const track: string[] = []
for (let x = 0; x < w; x++) {
  let c = "_"
  for (let y = 0; y < h; y++) if (rows[y][x] !== ".") c = rows[y][x]
  track.push(c)
}

let pos = 0
let dir = 1
while (true) {
  const t = track[pos]
  if (t === "_") inertia -= 1
  else if ((t === "\\") === (dir === 1)) inertia += 9
  else inertia -= 10
  if (inertia < 0) {
    dir = -dir
    inertia = -inertia
  }
  if (inertia === 0) {
    if (t === "_") break
    continue
  }
  pos += dir
  if (pos === 0 || pos === w - 1) break
}
console.log(pos)
