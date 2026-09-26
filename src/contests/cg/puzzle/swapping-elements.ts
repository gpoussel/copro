// 🎮 CodinGame Puzzle - swapping-elements
// https://www.codingame.com/training/medium/swapping-elements

const n = parseInt(readline())
const values: number[] = []
for (let i = 0; i < n; i++) {
  const s = readline()
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) values.push(parseFloat(s))
  else {
    let sum = 0
    for (let j = 0; j < s.length; j++) sum += s.charCodeAt(j)
    values.push(sum)
  }
}

// Target position of each element once sorted
const order = values.map((_, i) => i).sort((a, b) => values[a] - values[b])
let possible = true
for (let i = 1; i < n; i++) if (values[order[i]] === values[order[i - 1]]) possible = false

if (!possible) console.log(-1)
else {
  // Minimum swaps = n - number of cycles in the permutation
  const visited: boolean[] = new Array(n).fill(false)
  let swaps = 0
  for (let i = 0; i < n; i++) {
    let length = 0
    for (let j = i; !visited[j]; j = order[j]) {
      visited[j] = true
      length++
    }
    if (length > 0) swaps += length - 1
  }
  console.log(swaps)
}
