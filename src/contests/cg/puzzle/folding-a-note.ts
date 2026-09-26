// 🎮 CodinGame Puzzle - folding-a-note
// https://www.codingame.com/training/medium/folding-a-note

type Ply = string[][]

const n = parseInt(readline())
const sheet: Ply = []
for (let i = 0; i < n; i++) sheet.push(readline().split(""))

const leftHalf = (p: Ply) => p.map(row => row.slice(0, row.length / 2))
const rightHalf = (p: Ply) => p.map(row => row.slice(row.length / 2))
const topHalf = (p: Ply) => p.slice(0, p.length / 2)
const bottomHalf = (p: Ply) => p.slice(p.length / 2)
const mirrorH = (p: Ply) => p.map(row => row.slice().reverse())
const mirrorV = (p: Ply) => p.slice().reverse()

// Plies from top to bottom. The folded half lands on top of the stack, flipped,
// so the bottom-most ply's flap becomes the new top.
let plies: Ply[] = [sheet]
let fold = 0
while (plies[0].length > 1 || plies[0][0].length > 1) {
  let moving: (p: Ply) => Ply
  let staying: (p: Ply) => Ply
  switch (fold % 4) {
    case 0: moving = p => mirrorH(rightHalf(p)); staying = leftHalf; break
    case 1: moving = p => mirrorV(bottomHalf(p)); staying = topHalf; break
    case 2: moving = p => mirrorH(leftHalf(p)); staying = rightHalf; break
    default: moving = p => mirrorV(topHalf(p)); staying = bottomHalf; break
  }
  plies = plies.slice().reverse().map(moving).concat(plies.map(staying))
  fold++
}
console.log(plies.map(p => p[0][0]).join(""))
