// 🎮 CodinGame Puzzle - next-car-license-plate
// https://www.codingame.com/

const [ab, cde, fg] = readline().split("-")
const n = Number(readline())

const A = "A".charCodeAt(0)
const pair = (s: string) => (s.charCodeAt(0) - A) * 26 + (s.charCodeAt(1) - A)
const unpair = (v: number) => String.fromCharCode(A + Math.floor(v / 26)) + String.fromCharCode(A + (v % 26))

// Ordering, from least to most significant: cde (1..999), fg (AA..ZZ), ab.
let index = (pair(ab) * 676 + pair(fg)) * 999 + (Number(cde) - 1)
index += n

const PERIOD = 676 * 676 * 999
index %= PERIOD

const newCde = (index % 999) + 1
index = Math.floor(index / 999)
const newFg = index % 676
const newAb = Math.floor(index / 676)

console.log(`${unpair(newAb)}-${String(newCde).padStart(3, "0")}-${unpair(newFg)}`)
