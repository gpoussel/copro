import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 24

export function solve() {
  const allPermutations = utils.iterate.permutations("0123456789".split(""))
  return allPermutations[999999].join("")
}
