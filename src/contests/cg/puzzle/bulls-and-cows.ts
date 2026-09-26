// 🎮 CodinGame Puzzle - bulls-and-cows
// https://www.codingame.com/training/medium/bulls-and-cows

function score(secret: string, guess: string): [number, number] {
  let bulls = 0
  const secretLeft = new Array(10).fill(0)
  const guessLeft = new Array(10).fill(0)
  for (let i = 0; i < 4; i++) {
    if (secret[i] === guess[i]) bulls++
    else {
      secretLeft[+secret[i]]++
      guessLeft[+guess[i]]++
    }
  }
  let cows = 0
  for (let d = 0; d < 10; d++) cows += Math.min(secretLeft[d], guessLeft[d])
  return [bulls, cows]
}

const n = parseInt(readline())
const clues: [string, number, number][] = []
for (let i = 0; i < n; i++) {
  const [guess, bulls, cows] = readline().trim().split(" ")
  clues.push([guess, +bulls, +cows])
}

for (let v = 0; v < 10000; v++) {
  const secret = ("000" + v).slice(-4)
  const ok = clues.every(([guess, bulls, cows]) => {
    const [b, c] = score(secret, guess)
    return b === bulls && c === cows
  })
  if (ok) {
    console.log(secret)
    break
  }
}
