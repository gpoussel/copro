// 🎮 CodinGame Puzzle - the-lucky-number
// https://www.codingame.com/training/expert/the-lucky-number

// Digit counting on [0, X]: walk the digits of X; at each position place a
// smaller digit and count completions of the k free digits. With a prefix
// holding only 6s (or only 8s) the rest must avoid the other one: 9^k. With
// neither, exactly one of them must appear: 2 * (9^k - 8^k). Leading zeros are
// harmless since 0 does not affect luckiness. Answer = f(R) - f(L - 1).

const [lowText, highText] = readline().split(" ")

const completions = (has6: boolean, has8: boolean, k: number): bigint => {
  if (has6 && has8) return 0n
  if (has6 || has8) return 9n ** BigInt(k)
  return 2n * (9n ** BigInt(k) - 8n ** BigInt(k))
}

const countUpTo = (x: bigint): bigint => {
  if (x <= 0n) return 0n
  const digits = x.toString()
  let total = 0n
  let has6 = false
  let has8 = false
  for (let i = 0; i < digits.length; i++) {
    const top = digits.charCodeAt(i) - 48
    const free = digits.length - i - 1
    for (let d = 0; d < top; d++) total += completions(has6 || d === 6, has8 || d === 8, free)
    if (top === 6) has6 = true
    if (top === 8) has8 = true
  }
  if (has6 !== has8) total++ // x itself
  return total
}

console.log((countUpTo(BigInt(highText)) - countUpTo(BigInt(lowText) - 1n)).toString())
