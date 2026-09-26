// 🎮 CodinGame Puzzle - mask-matching
// https://www.codingame.com/training/medium/mask-matching

const mask = BigInt("0x" + readline().trim())
const ZERO = BigInt(0)
const ONE = BigInt(1)

// Non-zero submasks of mask, in increasing order: next = (current - mask) & mask
let bits = 0
for (let m = mask; m > ZERO; m >>= ONE) if (m & ONE) bits++
const count = 2 ** bits - 1

const smallest: bigint[] = []
let sub = ZERO
while (smallest.length < Math.min(count, 15)) {
  sub = (sub - mask) & mask
  smallest.push(sub)
}

if (count <= 15) console.log(smallest.join(","))
else console.log(`${smallest.slice(0, 13).join(",")},...,${(mask - ONE) & mask},${mask}`)
