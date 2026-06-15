// 🎮 CodinGame Puzzle - faro-shuffle
// https://www.codingame.com/

const n: number = parseInt(readline(), 10)
let deck: string[] = readline().split(" ")

for (let s = 0; s < n; s++) {
  const half: number = Math.ceil(deck.length / 2)
  const first: string[] = deck.slice(0, half)
  const second: string[] = deck.slice(half)
  const merged: string[] = []
  for (let i = 0; i < first.length; i++) {
    merged.push(first[i])
    if (i < second.length) {
      merged.push(second[i])
    }
  }
  deck = merged
}

console.log(deck.join(" "))
