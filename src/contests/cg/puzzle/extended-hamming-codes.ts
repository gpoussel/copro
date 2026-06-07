// 🎮 CodinGame Puzzle - extended-hamming-codes
// https://www.codingame.com/training/easy/extended-hamming-codes

const bits = readline().split("").map(Number)

// The 16-bit block is laid out in a 4x4 grid:
//  0  1  2  3   (row 0, a b c d)
//  4  5  6  7   (row 1, e f g h)
//  8  9 10 11   (row 2, i j k l)
// 12 13 14 15   (row 3, m n o p)
//
// Parity bit positions and their check sets:
//  pos 0 (a): global parity — all 16 bits must have even number of 1s
//  pos 1 (b): parity for odd columns (col 1 & 3): positions 1,3,5,7,9,11,13,15
//  pos 2 (c): parity for last two columns (col 2 & 3): positions 2,3,6,7,10,11,14,15
//  pos 4 (e): parity for odd rows (row 1 & 3): positions 4,5,6,7,12,13,14,15
//  pos 8 (i): parity for last two rows (row 2 & 3): positions 8,9,10,11,12,13,14,15

// Check each parity group (including the parity bit itself in the group)
const p1 = [1, 3, 5, 7, 9, 11, 13, 15] // bit b covers odd columns
const p2 = [2, 3, 6, 7, 10, 11, 14, 15] // bit c covers last two columns
const p4 = [4, 5, 6, 7, 12, 13, 14, 15] // bit e covers odd rows
const p8 = [8, 9, 10, 11, 12, 13, 14, 15] // bit i covers last two rows

function parity(positions: number[]) {
  return positions.reduce((acc: number, i: number) => acc ^ bits[i], 0)
}

const s1 = parity(p1) // 1 if p1 group parity is odd (error in odd-column positions)
const s2 = parity(p2) // 1 if p2 group parity is odd
const s4 = parity(p4) // 1 if p4 group parity is odd
const s8 = parity(p8) // 1 if p8 group parity is odd

// syndrome = s8*8 + s4*4 + s2*2 + s1*1
// This gives the 1-based index of the errored bit in the Hamming scheme.
// However, our positions are 0-based. The syndromes encode the position directly
// in the 4x4 grid where:
//   col = s2*2 + s1*1  (0-3)
//   row = s8*2 + s4*1  (0-3) ... wait, let me reconsider
//
// Actually the syndrome bits correspond to which "check" failed:
//   s1 = column parity check for bit1 (odd columns = col 1,3)
//   s2 = column parity check for bit2 (last two columns = col 2,3)
//   s4 = row parity check for bit4 (odd rows = row 1,3)
//   s8 = row parity check for bit8 (last two rows = row 2,3)
//
// The column index of the error:
//   col = s2*2 + s1
//   If s1=1, s2=0 → col=1; s1=0, s2=1 → col=2; s1=1, s2=1 → col=3; s1=0, s2=0 → col=0
//
// The row index of the error:
//   row = s8*2 + s4
//   If s4=1, s8=0 → row=1; s4=0, s8=1 → row=2; s4=1, s8=1 → row=3; s4=0, s8=0 → row=0
//
// The flat index: row*4 + col

const col = s2 * 2 + s1
const row = s8 * 2 + s4
const syndrome = row * 4 + col // flat position of the erroneous bit (0-15), 0 means no error in Hamming bits

// Global parity check: count all 1s in the full message
const globalParity = bits.reduce((acc, b) => acc ^ b, 0)

// Decision logic:
// - syndrome == 0 and globalParity == 0 → no error
// - syndrome != 0 and globalParity == 1 → single-bit error at position syndrome, flip it
// - syndrome != 0 and globalParity == 0 → two errors (syndrome points somewhere but overall parity ok)
// - syndrome == 0 and globalParity == 1 → error in the global parity bit itself (pos 0), flip it

if (syndrome === 0 && globalParity === 0) {
  // No error
  console.log(bits.join(""))
} else if (globalParity === 1) {
  // Single bit error at position syndrome (or pos 0 if syndrome==0)
  const errorPos = syndrome === 0 ? 0 : syndrome
  bits[errorPos] ^= 1
  console.log(bits.join(""))
} else {
  // syndrome != 0 but globalParity == 0 → two errors
  console.log("TWO ERRORS")
}
