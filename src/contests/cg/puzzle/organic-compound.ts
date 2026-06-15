// 🎮 CodinGame Puzzle - organic-compound
// https://www.codingame.com/

const formula: string = readline().trim()

const prefixes: string[] = ["meth", "eth", "prop", "but", "pent", "hex", "hept", "oct", "non", "dec"]

const count = (element: string): number => {
  let total = 0
  const re = new RegExp(element + "(\\d*)", "g")
  let match: RegExpExecArray | null
  while ((match = re.exec(formula)) !== null) {
    total += match[1] === "" ? 1 : parseInt(match[1], 10)
  }
  return total
}

const onlyCHO: boolean = /^[CHO0-9]+$/.test(formula)

const n: number = count("C")
const h: number = count("H")
const o: number = count("O")

const classify = (): string => {
  if (!onlyCHO || n < 1 || n > 10) {
    return "OTHERS"
  }
  const prefix: string = prefixes[n - 1]
  if (o === 0) {
    if (h === 2 * n + 2) {
      return prefix + "ane"
    }
    if (h === 2 * n && n > 1) {
      return prefix + "ene"
    }
    return "OTHERS"
  }
  if (o === 1) {
    if (h === 2 * n + 2 && formula.endsWith("OH")) {
      return prefix + "anol"
    }
    if (h === 2 * n && formula.endsWith("CHO")) {
      return prefix + "anal"
    }
    if (h === 2 * n && n >= 3 && !formula.endsWith("CHO")) {
      return prefix + "anone"
    }
    return "OTHERS"
  }
  if (o === 2) {
    if (h === 2 * n && formula.endsWith("COOH")) {
      return prefix + "anoic acid"
    }
    return "OTHERS"
  }
  return "OTHERS"
}

console.log(classify())
