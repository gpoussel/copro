// 🎮 CodinGame Puzzle - hunger
// https://www.codingame.com/training/medium/hunger

const [n, k] = readline().trim().split(/\s+/).map(Number)
const sweetness: number[] = []
while (sweetness.length < n) {
  for (const s of readline().trim().split(/\s+/)) if (s !== "") sweetness.push(+s)
}

// Prefix sums of +1 (good food) / -1 (other food): a feast is good if its sum is > 0
const prefix: number[] = [0]
for (let i = 0; i < n; i++) prefix.push(prefix[i] + (sweetness[i] >= k ? 1 : -1))

let best = 0
for (let i = 0; i < n; i++) {
  for (let j = n; j - i > best; j--) {
    if (prefix[j] - prefix[i] > 0) {
      best = j - i
      break
    }
  }
}
console.log(best)
