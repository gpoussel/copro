// 🎮 CodinGame Puzzle - faro-shuffle
// https://www.codingame.com/training/easy/faro-shuffle

const n: number = parseInt(readline(), 10)
let deck: string[] = readline().split(" ")
for (let i = 0; i < n; i++) {
  const half: number = Math.ceil(deck.length / 2)
  const first: string[] = deck.slice(0, half)
  const second: string[] = deck.slice(half)
  const merged: string[] = []
  for (let j = 0; j < half; j++) {
    merged.push(first[j])
    if (j < second.length) merged.push(second[j])
  }
  deck = merged
}
console.log(deck.join(" "))
