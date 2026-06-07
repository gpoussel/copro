// 🎮 CodinGame Puzzle - jack-silver-the-casino
// https://www.codingame.com/training/easy/jack-silver-the-casino

const rounds = parseInt(readline())
let cash = parseInt(readline())

for (let i = 0; i < rounds; i++) {
  const parts = readline().split(" ")
  const ball = parseInt(parts[0])
  const call = parts[1]
  const number = parts[2] !== undefined ? parseInt(parts[2]) : -1

  // Bet is 1/4 of current cash, rounded up
  const bet = Math.ceil(cash / 4)

  let win = false
  if (call === "EVEN") {
    // Even non-zero
    win = ball !== 0 && ball % 2 === 0
  } else if (call === "ODD") {
    win = ball % 2 !== 0
  } else if (call === "PLAIN") {
    win = ball === number
  }

  if (win) {
    if (call === "PLAIN") {
      cash += bet * 35
    } else {
      cash += bet
    }
  } else {
    cash -= bet
  }
}

console.log(cash + 0)
