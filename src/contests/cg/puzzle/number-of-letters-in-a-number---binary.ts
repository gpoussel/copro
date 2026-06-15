const parts = readline().split(" ")
const start = BigInt(parts[0])
const n = BigInt(parts[1])

const len: { [c: string]: number } = { "0": 4, "1": 3 } // zero=4, one=3

function next(v: bigint): bigint {
  const bin = v.toString(2)
  let count = 0
  for (const c of bin) count += len[c]
  return BigInt(count)
}

const seen = new Map<string, bigint>()
const seq: bigint[] = []
let cur = start
let idx = 0n
let result: bigint | null = null

while (true) {
  if (idx === n) {
    result = cur
    break
  }
  const key = cur.toString()
  if (seen.has(key)) {
    const startIdx = seen.get(key)!
    const cycleLen = idx - startIdx
    const offset = (n - startIdx) % cycleLen
    result = seq[Number(startIdx + offset)]
    break
  }
  seen.set(key, idx)
  seq.push(cur)
  cur = next(cur)
  idx++
}

console.log(result!.toString())
