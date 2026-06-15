// 🎮 CodinGame Puzzle - artificial-emotional-intelligence
// https://www.codingame.com/

const name: string = readline()

const adjList: string[] =
  "Adaptable Adventurous Affectionate Courageous Creative Dependable Determined Diplomatic Giving Gregarious Hardworking Helpful Hilarious Honest Non-judgmental Observant Passionate Sensible Sensitive Sincere".split(
    " "
  )
const goodList: string[] = ["Love", "Forgiveness", "Friendship", "Inspiration", "Epic Transformations", "Wins"]
const badList: string[] = ["Crime", "Disappointment", "Disasters", "Illness", "Injury", "Investment Loss"]

const vowels = "aeiouy"
const consonants = "bcdfghjklmnpqrstvwxz"

const consPos: number[] = []
const vowPos: number[] = []
const seenCons: Set<string> = new Set()

for (const ch of name.toLowerCase()) {
  const vi = vowels.indexOf(ch)
  if (vi >= 0) {
    if (vowPos.length < 2) vowPos.push(vi + 1)
    continue
  }
  const ci = consonants.indexOf(ch)
  if (ci >= 0 && !seenCons.has(ch)) {
    seenCons.add(ch)
    if (consPos.length < 3) consPos.push(ci + 1)
  }
}

if (consPos.length < 3 || vowPos.length < 2) {
  console.log(`Hello ${name}.`)
} else {
  const adj1 = adjList[consPos[0] - 1].toLowerCase()
  const adj2 = adjList[consPos[1] - 1].toLowerCase()
  const adj3 = adjList[consPos[2] - 1].toLowerCase()
  const good = goodList[vowPos[0] - 1].toLowerCase()
  const bad = badList[vowPos[1] - 1].toLowerCase()
  console.log(`It's so nice to meet you, my dear ${adj1} ${name}.`)
  console.log(`I sense you are both ${adj2} and ${adj3}.`)
  console.log(`May our future together have much more ${good} than ${bad}.`)
}
