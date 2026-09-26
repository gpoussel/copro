// 🎮 CodinGame Puzzle - the-experience-for-creating-puzzles
// https://www.codingame.com/training/medium/the-experience-for-creating-puzzles

let currentLevel = +readline()
let xpNeeded = +readline()
let xpGained = +readline() * 300

const xpForLevel = (lvl: number): number => Math.floor(lvl * Math.sqrt(lvl) * 10)

while (xpGained >= xpNeeded) {
  xpGained -= xpNeeded
  currentLevel++
  xpNeeded = xpForLevel(currentLevel)
}
xpNeeded -= xpGained

console.log(currentLevel)
console.log(xpNeeded)
