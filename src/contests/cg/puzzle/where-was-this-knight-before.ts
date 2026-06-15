// 🎮 CodinGame Puzzle - where-was-this-knight-before
// https://www.codingame.com/

const pieces: string = readline()
const valid: Set<string> = new Set<string>()
for (const c of pieces) {
  valid.add(c.toUpperCase())
  valid.add(c.toLowerCase())
}

const before: string[] = []
for (let i = 0; i < 8; i++) before.push(readline())
const after: string[] = []
for (let i = 0; i < 8; i++) after.push(readline())

const isPiece = (c: string): boolean => valid.has(c)

let fromR = -1
let fromC = -1
let toR = -1
let toC = -1

for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    const b: string = before[r][c]
    const a: string = after[r][c]
    if (isPiece(b) && !isPiece(a)) {
      fromR = r
      fromC = c
    }
  }
}

const moved: string = before[fromR][fromC]

for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    if (r === fromR && c === fromC) continue
    if (after[r][c] === moved && before[r][c] !== moved) {
      toR = r
      toC = c
    }
  }
}

const coord = (r: number, c: number): string => String.fromCharCode(97 + c) + String(8 - r)

const captured: boolean = isPiece(before[toR][toC])
const sep: string = captured ? "x" : "-"

console.log(coord(fromR, fromC) + sep + coord(toR, toC))

const dr: number = Math.abs(toR - fromR)
const dc: number = Math.abs(toC - fromC)
const knight: boolean = (dr === 2 && dc === 1) || (dr === 1 && dc === 2)
console.log(knight ? "Knight" : "Other")
