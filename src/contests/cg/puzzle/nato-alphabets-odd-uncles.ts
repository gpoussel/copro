// 🎮 CodinGame Puzzle - nato-alphabets-odd-uncles
// https://www.codingame.com/training/easy/nato-alphabets-odd-uncles

const alphabets: string[][] = [
  "Authority Bills Capture Destroy Englishmen Fractious Galloping High Invariably Juggling Knights Loose Managing Never Owners Play Queen Remarks Support The Unless Vindictive When Xpeditiously Your Zigzag".split(
    " "
  ),
  "Apples Butter Charlie Duff Edward Freddy George Harry Ink Johnnie King London Monkey Nuts Orange Pudding Queenie Robert Sugar Tommy Uncle Vinegar Willie Xerxes Yellow Zebra".split(
    " "
  ),
  "Amsterdam Baltimore Casablanca Denmark Edison Florida Gallipoli Havana Italia Jerusalem Kilogramme Liverpool Madagascar New-York Oslo Paris Quebec Roma Santiago Tripoli Uppsala Valencia Washington Xanthippe Yokohama Zurich".split(
    " "
  ),
  "Alfa Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliett Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu".split(
    " "
  ),
]

const words = readline().split(" ")

// Determine which alphabet the input belongs to by intersecting across words.
let possible = [0, 1, 2, 3]
for (const w of words) {
  const inAlpha = [0, 1, 2, 3].filter(a => alphabets[a].includes(w))
  possible = possible.filter(a => inAlpha.includes(a))
}
const srcAlpha = possible[0]
const targetAlpha = srcAlpha === 3 ? 0 : srcAlpha + 1

const result = words.map(w => {
  const idx = alphabets[srcAlpha].indexOf(w)
  return alphabets[targetAlpha][idx]
})
console.log(result.join(" "))
