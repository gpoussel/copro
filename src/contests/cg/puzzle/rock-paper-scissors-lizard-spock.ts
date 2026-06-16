// 🎮 CodinGame Puzzle - rock-paper-scissors-lizard-spock
// https://www.codingame.com/training/easy/rock-paper-scissors-lizard-spock

const N = parseInt(readline())
const players: { num: number; sign: string }[] = []
for (let i = 0; i < N; i++) {
  const parts = readline().split(" ")
  players.push({ num: parseInt(parts[0]), sign: parts[1] })
}

// wins[a] = set of signs that a beats
const wins: Record<string, string[]> = {
  R: ["C", "L"], // Rock crushes Scissors (C), Rock crushes Lizard
  P: ["R", "S"], // Paper covers Rock, Paper disproves Spock
  C: ["P", "L"], // Scissors cuts Paper, Scissors decapitates Lizard
  L: ["S", "P"], // Lizard poisons Spock, Lizard eats Paper
  S: ["C", "R"], // Spock smashes Scissors, Spock vaporizes Rock
}

function beats(a: string, b: string): boolean {
  return wins[a].includes(b)
}

function fight(
  p1: { num: number; sign: string },
  p2: { num: number; sign: string }
): { winner: { num: number; sign: string }; loser: { num: number; sign: string } } {
  if (p1.sign === p2.sign) {
    // tie: lower number wins
    return p1.num < p2.num ? { winner: p1, loser: p2 } : { winner: p2, loser: p1 }
  }
  if (beats(p1.sign, p2.sign)) {
    return { winner: p1, loser: p2 }
  }
  return { winner: p2, loser: p1 }
}

// Run the tournament
let bracket = [...players]
// Track opponents of the eventual winner by running each round
// We need to track who the final winner beats across all rounds
// Approach: simulate round by round, track each player's opponents list
const playerOpponents: Map<number, number[]> = new Map()
for (const p of players) {
  playerOpponents.set(p.num, [])
}

while (bracket.length > 1) {
  const nextBracket: { num: number; sign: string }[] = []
  for (let i = 0; i < bracket.length; i += 2) {
    const p1 = bracket[i]
    const p2 = bracket[i + 1]
    const { winner, loser } = fight(p1, p2)
    // The winner inherits the opponents list: their own + loser's opponents list + loser themselves
    const winnerOpps = playerOpponents.get(winner.num)!
    // loser's opponents become part of winner's history? No - we only track who the FINAL winner faced.
    // Actually: each player's "opponents" in playerOpponents tracks only direct opponents they defeated.
    // We'll just track direct opponents per player.
    winnerOpps.push(loser.num)
    nextBracket.push(winner)
  }
  bracket = nextBracket
}

const finalWinner = bracket[0]
const finalOpponents = playerOpponents.get(finalWinner.num)!

console.log(finalWinner.num)
console.log(finalOpponents.join(" "))
