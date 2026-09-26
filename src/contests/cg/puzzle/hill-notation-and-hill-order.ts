// 🎮 CodinGame Puzzle - hill-notation-and-hill-order
// https://www.codingame.com/training/medium/hill-notation-and-hill-order

type Counts = { [element: string]: number }

// Recursive-descent parser handling nested parenthesis groups
const parseFormula = (formula: string): Counts => {
  let pos = 0
  const readNumber = (): number => {
    let digits = ""
    while (pos < formula.length && formula[pos] >= "0" && formula[pos] <= "9") digits += formula[pos++]
    return digits === "" ? 1 : +digits
  }
  const parseGroup = (): Counts => {
    const counts: Counts = {}
    const add = (el: string, n: number): void => {
      counts[el] = (counts[el] || 0) + n
    }
    while (pos < formula.length && formula[pos] !== ")") {
      if (formula[pos] === "(") {
        pos++
        const inner = parseGroup()
        pos++ // closing parenthesis
        const factor = readNumber()
        for (const el in inner) add(el, inner[el] * factor)
      } else {
        let el = formula[pos++]
        while (pos < formula.length && formula[pos] >= "a" && formula[pos] <= "z") el += formula[pos++]
        add(el, readNumber())
      }
    }
    return counts
  }
  return parseGroup()
}

const toHill = (counts: Counts): [string, number][] => {
  const elements = Object.keys(counts).sort()
  const ordered: string[] = []
  if (counts["C"] !== undefined) {
    ordered.push("C")
    if (counts["H"] !== undefined) ordered.push("H")
  }
  for (const el of elements) if (ordered.indexOf(el) < 0) ordered.push(el)
  return ordered.map(el => [el, counts[el]] as [string, number])
}

const hillString = (terms: [string, number][]): string => terms.map(([el, n]) => (n === 1 ? el : el + n)).join("")

const compareHill = (a: [string, number][], b: [string, number][]): number => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i][0] !== b[i][0]) return a[i][0] < b[i][0] ? -1 : 1
    if (a[i][1] !== b[i][1]) return a[i][1] - b[i][1]
  }
  return a.length - b.length
}

const compoundCount = +readline()
const seen: { [hill: string]: boolean } = {}
const compounds: [string, number][][] = []
for (let i = 0; i < compoundCount; i++) {
  const terms = toHill(parseFormula(readline().trim()))
  const key = hillString(terms)
  if (seen[key]) continue
  seen[key] = true
  compounds.push(terms)
}
compounds.sort(compareHill)
for (const terms of compounds) console.log(hillString(terms))
