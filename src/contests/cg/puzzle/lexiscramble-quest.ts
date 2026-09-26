// 🎮 CodinGame Puzzle - lexiscramble-quest
// https://www.codingame.com/training/medium/lexiscramble-quest

const word = readline().trim()

const factorials: bigint[] = [BigInt(1)]
for (let i = 1; i <= word.length; i++) factorials.push(factorials[i - 1] * BigInt(i))

const counts: { [letter: string]: number } = {}
for (const ch of word) counts[ch] = (counts[ch] || 0) + 1

// Number of distinct arrangements of the multiset described by counts
const arrangements = (total: number): bigint => {
  let result = factorials[total]
  for (const letter in counts) result /= factorials[counts[letter]]
  return result
}

// Rank = 1 + number of distinct words starting with a smaller letter at the first differing position
let rank = BigInt(1)
for (let i = 0; i < word.length; i++) {
  const remaining = word.length - i - 1
  for (const letter of Object.keys(counts).sort()) {
    if (letter >= word[i]) break
    if (counts[letter] === 0) continue
    counts[letter]--
    rank += arrangements(remaining)
    counts[letter]++
  }
  counts[word[i]]--
}
console.log(rank.toString())
