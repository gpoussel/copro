import { AdventOfCodeContest } from "../../../../../types/contest.js"
import { dijkstraOnGraph } from "../../../../../utils/algo.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2019 - Day 14

interface ReactionElement {
  quantity: number
  name: string
}

interface Reaction {
  input: ReactionElement[]
  output: ReactionElement
}

function parseElement(element: string): ReactionElement {
  const [quantity, name] = element.split(" ")
  return { quantity: +quantity, name }
}

function parseInput(input: string): Reaction[] {
  return utils.input.lines(input).map(line => {
    const [input, output] = line.split(" => ")
    const inputElements = input.split(", ")
    return {
      input: inputElements.map(parseElement),
      output: parseElement(output),
    }
  })
}

function produceRecursively(
  reactions: Reaction[],
  target: ReactionElement,
  leftovers: Map<string, number>
): { possible: boolean } {
  if (target.name === "ORE") {
    // End of the recursion
    const oreQuantity = leftovers.get("ORE") || 0
    return {
      possible: target.quantity <= oreQuantity,
    }
  }
  const reactionsThatProduceTarget = reactions.filter(reaction => reaction.output.name === target.name)
  if (reactionsThatProduceTarget.length !== 1) {
    throw new Error(`Expected exactly one reaction to produce ${target.name}, got ${reactionsThatProduceTarget.length}`)
  }
  const reaction = reactionsThatProduceTarget[0]
  const numberOfReactions = Math.ceil(target.quantity / reaction.output.quantity)
  for (const input of reaction.input) {
    const inputQuantity = input.quantity * numberOfReactions
    const leftoverQuantity = leftovers.get(input.name) || 0
    const neededQuantity = inputQuantity - leftoverQuantity
    if (neededQuantity > 0) {
      leftovers.set(input.name, 0)
      const result = produceRecursively(reactions, { name: input.name, quantity: neededQuantity }, leftovers)
      if (!result.possible) {
        return { possible: false }
      }
    } else {
      leftovers.set(input.name, leftoverQuantity - inputQuantity)
    }
  }
  const leftoverQuantity = reaction.output.quantity * numberOfReactions - target.quantity
  leftovers.set(target.name, leftoverQuantity)
  return { possible: true }
}

function part1(inputString: string) {
  const reactions = parseInput(inputString)
  let min = 1
  let max = 10_000_000
  while (min < max) {
    const mid = Math.floor((min + max) / 2)
    const map = new Map<string, number>()
    map.set("ORE", mid)
    const result = produceRecursively(reactions, { name: "FUEL", quantity: 1 }, map)
    if (result.possible) {
      max = mid
    } else {
      min = mid + 1
    }
  }
  return min
}

function part2(inputString: string) {
  const reactions = parseInput(inputString)
  let min = 1
  let max = 100_000_000
  while (min < max) {
    const mid = Math.floor((min + max) / 2)
    const map = new Map<string, number>()
    map.set("ORE", 1000000000000)
    const result = produceRecursively(reactions, { name: "FUEL", quantity: mid }, map)
    if (result.possible) {
      min = mid + 1
    } else {
      max = mid
    }
  }
  return min - 1
}

const EXAMPLE1 = `
10 ORE => 10 A
1 ORE => 1 B
7 A, 1 B => 1 C
7 A, 1 C => 1 D
7 A, 1 D => 1 E
7 A, 1 E => 1 FUEL`

const EXAMPLE2 = `
9 ORE => 2 A
8 ORE => 3 B
7 ORE => 5 C
3 A, 4 B => 1 AB
5 B, 7 C => 1 BC
4 C, 1 A => 1 CA
2 AB, 3 BC, 4 CA => 1 FUEL`

const EXAMPLE3 = `
157 ORE => 5 NZVS
165 ORE => 6 DCFZ
44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
179 ORE => 7 PSHF
177 ORE => 5 HKGWZ
7 DCFZ, 7 PSHF => 2 XJWVT
165 ORE => 2 GPVTF
3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`

const EXAMPLE4 = `
2 VPVL, 7 FWMGM, 2 CXFTF, 11 MNCFX => 1 STKFG
17 NVRVD, 3 JNWZP => 8 VPVL
53 STKFG, 6 MNCFX, 46 VJHF, 81 HVMC, 68 CXFTF, 25 GNMV => 1 FUEL
22 VJHF, 37 MNCFX => 5 FWMGM
139 ORE => 4 NVRVD
144 ORE => 7 JNWZP
5 MNCFX, 7 RFSQX, 2 FWMGM, 2 VPVL, 19 CXFTF => 3 HVMC
5 VJHF, 7 MNCFX, 9 VPVL, 37 CXFTF => 6 GNMV
145 ORE => 6 MNCFX
1 NVRVD => 8 CXFTF
1 VJHF, 6 MNCFX => 4 RFSQX
176 ORE => 6 VJHF`

const EXAMPLE5 = `
171 ORE => 8 CNZTR
7 ZLQW, 3 BMBT, 9 XCVML, 26 XMNCP, 1 WPTQ, 2 MZWV, 1 RJRHP => 4 PLWSL
114 ORE => 4 BHXH
14 VRPVC => 6 BMBT
6 BHXH, 18 KTJDG, 12 WPTQ, 7 PLWSL, 31 FHTLT, 37 ZDVW => 1 FUEL
6 WPTQ, 2 BMBT, 8 ZLQW, 18 KTJDG, 1 XMNCP, 6 MZWV, 1 RJRHP => 6 FHTLT
15 XDBXC, 2 LTCX, 1 VRPVC => 6 ZLQW
13 WPTQ, 10 LTCX, 3 RJRHP, 14 XMNCP, 2 MZWV, 1 ZLQW => 1 ZDVW
5 BMBT => 4 WPTQ
189 ORE => 9 KTJDG
1 MZWV, 17 XDBXC, 3 XCVML => 2 XMNCP
12 VRPVC, 27 CNZTR => 2 XDBXC
15 KTJDG, 12 BHXH => 5 XCVML
3 BHXH, 2 VRPVC => 7 MZWV
121 ORE => 7 VRPVC
7 XCVML => 6 RJRHP
5 BHXH, 4 VRPVC => 5 LTCX`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 31,
      },
      {
        input: EXAMPLE2,
        expected: 165,
      },
      {
        input: EXAMPLE3,
        expected: 13312,
      },
      {
        input: EXAMPLE4,
        expected: 180697,
      },
      {
        input: EXAMPLE5,
        expected: 2210736,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE3,
        expected: 82892753,
      },
      {
        input: EXAMPLE4,
        expected: 5586022,
      },
      {
        input: EXAMPLE5,
        expected: 460664,
      },
    ],
  },
} as AdventOfCodeContest
