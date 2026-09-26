// 🎮 CodinGame Puzzle - remaining-card
// https://www.codingame.com/training/medium/remaining-card
//
// Josephus-like: with L the largest power of two <= N, the survivor is N if N = L, else 2 * (N - L).

const cardCount = parseInt(readline(), 10)
let highestPower = 1
while (highestPower * 2 <= cardCount) highestPower *= 2
console.log(cardCount === highestPower ? cardCount : 2 * (cardCount - highestPower))
