import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2020 - Day 21

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [ingredientsPart, allergensPart] = line.split(" (contains ")
    const ingredients = ingredientsPart.split(" ")
    const allergens = allergensPart
      ? allergensPart
          .slice(0, -1)
          .split(", ")
          .map(a => a.trim())
      : []
    return { ingredients, allergens }
  })
}

function solve(input: ReturnType<typeof parseInput>) {
  const allergens = new Set<string>()
  for (const entry of input) {
    for (const allergen of entry.allergens) {
      allergens.add(allergen)
    }
  }
  const allergensToCandidates = new Map<string, Set<string>>()
  for (const allergen of allergens) {
    const entriesWithAllergen = input.filter(entry => entry.allergens.includes(allergen))
    const candidateIngredients = new Set<string>(entriesWithAllergen[0].ingredients)
    for (const entry of entriesWithAllergen.slice(1)) {
      for (const ingredient of candidateIngredients) {
        if (!entry.ingredients.includes(ingredient)) {
          candidateIngredients.delete(ingredient)
        }
      }
    }
    allergensToCandidates.set(allergen, candidateIngredients)
  }
  const allergensToIngredients = new Map<string, string>()
  while (allergensToIngredients.size < allergens.size) {
    for (const [allergen, candidates] of allergensToCandidates) {
      if (candidates.size === 1) {
        const ingredient = candidates.values().next().value!
        allergensToIngredients.set(allergen, ingredient)
        for (const otherCandidates of allergensToCandidates.values()) {
          otherCandidates.delete(ingredient)
        }
        allergensToCandidates.delete(allergen)
      }
    }
  }
  return allergensToIngredients
}

function getIngredients(input: ReturnType<typeof parseInput>) {
  const ingredients = new Set<string>()
  for (const entry of input) {
    for (const ingredient of entry.ingredients) {
      ingredients.add(ingredient)
    }
  }
  return ingredients
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  const allergensToIngredients = solve(input)
  const safeIngredients = new Set<string>(getIngredients(input))
  for (const ingredient of allergensToIngredients.values()) {
    safeIngredients.delete(ingredient)
  }
  let count = 0
  for (const entry of input) {
    for (const ingredient of entry.ingredients) {
      if (safeIngredients.has(ingredient)) {
        count++
      }
    }
  }
  return count
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const allergensToIngredients = solve(input)
  const sortedAllergens = Array.from(allergensToIngredients.keys()).sort()
  return sortedAllergens.map(allergen => allergensToIngredients.get(allergen)!).join(",")
}

const EXAMPLE = `
mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 5,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: "mxmxvkd,sqjhc,fvjkl",
      },
    ],
  },
} as AdventOfCodeContest
