// 🎮 CodinGame Puzzle - locked-in-gear
// https://www.codingame.com/training/medium/locked-in-gear

const n = parseInt(readline())
const gears: number[][] = []
for (let i = 0; i < n; i++) gears.push(readline().split(" ").map(Number))

const touching = (a: number[], b: number[]) =>
  (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 === (a[2] + b[2]) ** 2

// 2-colour the component of the first gear: 1 = CW, -1 = CCW.
// An odd cycle anywhere in the component jams every gear in it.
const dir: number[] = new Array(n).fill(0)
dir[0] = 1
const queue = [0]
let jammed = false
for (let qi = 0; qi < queue.length; qi++) {
  const g = queue[qi]
  for (let h = 0; h < n; h++) {
    if (h === g || !touching(gears[g], gears[h])) continue
    if (dir[h] === 0) {
      dir[h] = -dir[g]
      queue.push(h)
    } else if (dir[h] === dir[g]) {
      jammed = true
    }
  }
}

const last = dir[n - 1]
console.log(jammed || last === 0 ? "NOT MOVING" : last === 1 ? "CW" : "CCW")
