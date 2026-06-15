// 🎮 CodinGame Puzzle - deus-hex-machina
// https://www.codingame.com/

const input: string = readline().trim()

const HEX = "0123456789abcdef"

// The vertical and horizontal seven-segment flips commute and are involutions,
// so the shapes form a Klein-four orbit structure with 29 distinct states:
// 16 are the hex digits, the rest are non-hex ("#") shapes that can flip back.
// vt / ht are the per-state flip permutations; lab maps a state to its hex value
// (-1 = not a valid hex digit); node maps a starting hex digit to its state.
const vt: number[] = [
  0, 1, 3, 2, 4, 5, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 17, 16, 18, 20, 19, 22, 21, 23, 24, 26, 25, 28, 27,
]
const ht: number[] = [
  0, 1, 3, 2, 5, 4, 8, 9, 6, 7, 12, 13, 10, 11, 16, 17, 14, 15, 18, 21, 22, 19, 20, 24, 23, 27, 28, 25, 26,
]
const lab: number[] = [
  0, 1, 2, 5, 3, -1, 4, -1, -1, -1, 6, 14, 10, 9, 7, -1, -1, -1, 8, 11, -1, 13, -1, 12, -1, 15, -1, -1, -1,
]
const node: number[] = [0, 1, 2, 4, 6, 3, 10, 14, 18, 13, 12, 19, 23, 21, 11, 25]

const S = 29

// The flip sequence is the number in binary (MSB first); 1 = vertical, 0 = horizontal.
let value = 0n
for (const ch of input) value = value * 16n + BigInt(HEX.indexOf(ch))
const seq = value === 0n ? "0" : value.toString(2)

// Two consecutive identical flips cancel (each flip is an involution), so reduce
// the sequence. This keeps it short even for 10000-digit inputs.
const reduced: string[] = []
let hCount = 0
for (const ch of seq) {
  if (ch === "0") hCount++
  if (reduced.length > 0 && reduced[reduced.length - 1] === ch) reduced.pop()
  else reduced.push(ch)
}

// All positions undergo the same flip sequence, so compose it once into a single
// per-state permutation F, then apply F to every input digit. A single reversal is
// applied iff the number of horizontal flips is odd.
const composed: number[] = []
for (let i = 0; i < S; i++) composed.push(i)
for (const ch of reduced) {
  const m = ch === "1" ? vt : ht
  for (let i = 0; i < S; i++) composed[i] = m[composed[i]]
}

const digits: number[] = []
let valid = true
for (const ch of input) {
  const state = composed[node[HEX.indexOf(ch)]]
  const v = lab[state]
  if (v < 0) {
    valid = false
    break
  }
  digits.push(v)
}

if (!valid) {
  console.log("Not a number")
} else {
  if (hCount % 2 === 1) digits.reverse()
  let result = digits.map(d => HEX[d]).join("")
  if (result.length > 1000) result = result.slice(0, 1000)
  console.log(result)
}
