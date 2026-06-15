// 🎮 CodinGame Puzzle - nato-alphabets-odd-uncles
// https://www.codingame.com/

const alphabets: string[][] = [
  [
    "Authority",
    "Bills",
    "Capture",
    "Destroy",
    "Englishmen",
    "Fractious",
    "Galloping",
    "High",
    "Invariably",
    "Juggling",
    "Knights",
    "Loose",
    "Managing",
    "Never",
    "Owners",
    "Play",
    "Queen",
    "Remarks",
    "Support",
    "The",
    "Unless",
    "Vindictive",
    "When",
    "Xpeditiously",
    "Your",
    "Zigzag",
  ],
  [
    "Apples",
    "Butter",
    "Charlie",
    "Duff",
    "Edward",
    "Freddy",
    "George",
    "Harry",
    "Ink",
    "Johnnie",
    "King",
    "London",
    "Monkey",
    "Nuts",
    "Orange",
    "Pudding",
    "Queenie",
    "Robert",
    "Sugar",
    "Tommy",
    "Uncle",
    "Vinegar",
    "Willie",
    "Xerxes",
    "Yellow",
    "Zebra",
  ],
  [
    "Amsterdam",
    "Baltimore",
    "Casablanca",
    "Denmark",
    "Edison",
    "Florida",
    "Gallipoli",
    "Havana",
    "Italia",
    "Jerusalem",
    "Kilogramme",
    "Liverpool",
    "Madagascar",
    "New-York",
    "Oslo",
    "Paris",
    "Quebec",
    "Roma",
    "Santiago",
    "Tripoli",
    "Uppsala",
    "Valencia",
    "Washington",
    "Xanthippe",
    "Yokohama",
    "Zurich",
  ],
  [
    "Alfa",
    "Bravo",
    "Charlie",
    "Delta",
    "Echo",
    "Foxtrot",
    "Golf",
    "Hotel",
    "India",
    "Juliett",
    "Kilo",
    "Lima",
    "Mike",
    "November",
    "Oscar",
    "Papa",
    "Quebec",
    "Romeo",
    "Sierra",
    "Tango",
    "Uniform",
    "Victor",
    "Whiskey",
    "X-ray",
    "Yankee",
    "Zulu",
  ],
]

const words: string[] = readline().split(" ")

let source = -1
for (let i = 0; i < alphabets.length; i++) {
  if (words.every((w: string): boolean => alphabets[i].includes(w))) {
    source = i
    break
  }
}

const target: number = source === alphabets.length - 1 ? 0 : source + 1

const answer: string[] = words.map((w: string): string => {
  const idx: number = alphabets[source].indexOf(w)
  return alphabets[target][idx]
})

console.log(answer.join(" "))
