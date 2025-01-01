import utils from "../../../utils/index.js"

// 🧮 Project Euler - Problem 68

export function solve() {
  const strings: string[] = []
  for (const permutation of utils.iterate.permutations([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
    const [a, b, c, d, e, f, g, h, i, j] = permutation
    const sum = a + b + c
    const triplets = [
      [a, b, c],
      [d, c, e],
      [f, e, g],
      [h, g, i],
      [j, i, b],
    ]
    if (triplets.every(triplet => triplet.reduce((acc, val) => acc + val, 0) === sum)) {
      if (a < d && a < f && a < h && a < j) {
        strings.push(
          triplets
            .flatMap(triplet => triplet)
            .map(n => n.toString())
            .join("")
        )
      }
    }
  }
  return utils.iterate.maxBy(
    strings.filter(s => s.length === 16),
    s => +s
  )
}
