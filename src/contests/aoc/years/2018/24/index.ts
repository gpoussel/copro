import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2018 - Day 24

interface Group {
  units: number
  hitPoints: number
  attackDamage: number
  attackType: string
  initiative: number
  immunities: string[]
  weaknesses: string[]
}

function parseGroup(line: string): Group {
  const unitMatcher = line.match(/(\d+) units/)!
  const hitPointsMatcher = line.match(/(\d+) hit points/)!
  const attackMatcher = line.match(/(\d+) (\w+) damage/)!
  const initiativeMatcher = line.match(/initiative (\d+)/)!
  const immunityMatcher = line.match(/immune to ([^;)]+)/)
  const weakMatcher = line.match(/weak to ([^;)]+)/)
  return {
    units: +unitMatcher[1],
    hitPoints: +hitPointsMatcher[1],
    attackDamage: +attackMatcher[1],
    attackType: attackMatcher[2],
    initiative: +initiativeMatcher[1],
    immunities: immunityMatcher ? immunityMatcher[1].split(", ") : [],
    weaknesses: weakMatcher ? weakMatcher[1].split(", ") : [],
  }
}

function parseInput(input: string) {
  const [immuneBlock, infectionBlock] = utils.input.blocks(input)
  return {
    immune: utils.input.lines(immuneBlock).slice(1).map(parseGroup),
    infection: utils.input.lines(infectionBlock).slice(1).map(parseGroup),
  }
}

function getEffectivePower(group: Group) {
  return group.units * group.attackDamage
}

function getDamage(attacker: Group, defender: Group) {
  if (defender.immunities.includes(attacker.attackType)) {
    return 0
  }
  const multiplier = defender.weaknesses.includes(attacker.attackType) ? 2 : 1
  return getEffectivePower(attacker) * multiplier
}

function dealDamage(attacker: Group, defender: Group) {
  const damage = getDamage(attacker, defender)
  const unitsKilled = Math.floor(damage / defender.hitPoints)
  defender.units = Math.max(defender.units - unitsKilled, 0)
  return unitsKilled > 0
}

function targetSelectionComparator(a: Group, b: Group) {
  const aPower = getEffectivePower(a)
  const bPower = getEffectivePower(b)
  if (aPower !== bPower) {
    return bPower - aPower
  }
  return b.initiative - a.initiative
}

function selectTarget(attacker: Group, defenders: Group[]) {
  if (defenders.length === 0) {
    return
  }
  let mostDamage = {
    damage: -Infinity,
    defenders: [] as Group[],
  }
  for (const defender of defenders) {
    const damage = getDamage(attacker, defender)
    if (damage > mostDamage.damage) {
      mostDamage = { damage, defenders: [defender] }
    } else if (damage === mostDamage.damage) {
      mostDamage.defenders.push(defender)
    }
  }
  if (mostDamage.damage === 0) {
    return
  }
  if (mostDamage.defenders.length === 1) {
    return mostDamage.defenders[0]
  }
  return utils.iterate.maxBy(mostDamage.defenders, getEffectivePower)
}

function targetSelection(attackers: Group[], defenders: Group[]): Map<Group, Group> {
  const targets = new Map<Group, Group>()
  for (const attacker of attackers) {
    const defender = selectTarget(
      attacker,
      utils.iterate.differenceBy(defenders, [...targets.values()], g => g)
    )
    if (defender) {
      targets.set(attacker, defender)
    }
  }
  return targets
}

function simulateFight(immune: Group[], infection: Group[]) {
  let previousRemainingUnits = -1
  while (immune.length > 0 && infection.length > 0) {
    immune.sort(targetSelectionComparator)
    infection.sort(targetSelectionComparator)

    const targets = new Map([
      ...targetSelection(immune, infection).entries(),
      ...targetSelection(infection, immune).entries(),
    ])

    const attackers = [...targets.keys()].sort((a, b) => b.initiative - a.initiative)
    for (const attacker of attackers) {
      const defender = targets.get(attacker)!
      dealDamage(attacker, defender)
    }

    utils.iterate.removeIf(immune, g => g.units === 0)
    utils.iterate.removeIf(infection, g => g.units === 0)
    const remainingUnits = sumRemainingUnits([...immune, ...infection])
    if (remainingUnits === previousRemainingUnits) {
      break
    }
    previousRemainingUnits = remainingUnits
  }
}

function simulateWithBoost(
  immune: Group[],
  infection: Group[],
  boost: number
): { winner: "immune" | "infection" | "tie"; units: number } {
  for (const group of immune) {
    group.attackDamage += boost
  }
  simulateFight(immune, infection)
  if (immune.length === 0) {
    return {
      winner: "infection",
      units: sumRemainingUnits(infection),
    }
  } else if (infection.length === 0) {
    return {
      winner: "immune",
      units: sumRemainingUnits(immune),
    }
  }
  return {
    winner: "tie",
    units: sumRemainingUnits(immune),
  }
}

function sumRemainingUnits(groups: Group[]) {
  return groups.reduce((sum, g) => sum + g.units, 0)
}

function part1(inputString: string) {
  const { immune, infection } = parseInput(inputString)
  simulateFight(immune, infection)
  return sumRemainingUnits([...immune, ...infection])
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  const boostBounds = { min: 0, max: 1600 }
  while (boostBounds.min < boostBounds.max) {
    const boost = Math.floor((boostBounds.min + boostBounds.max) / 2)
    const { winner } = simulateWithBoost(
      input.immune.map(g => ({ ...g })),
      input.infection.map(g => ({ ...g })),
      boost
    )
    if (winner === "immune") {
      boostBounds.max = boost
    } else {
      boostBounds.min = boost + 1
    }
  }
  const { winner, units } = simulateWithBoost(
    input.immune.map(g => ({ ...g })),
    input.infection.map(g => ({ ...g })),
    boostBounds.min
  )
  if (winner !== "immune") {
    throw new Error("Boost was not enough")
  }
  return units
}

const EXAMPLE1 = `
Immune System:
17 units each with 5390 hit points (weak to radiation, bludgeoning) with an attack that does 4507 fire damage at initiative 2
989 units each with 1274 hit points (immune to fire; weak to bludgeoning, slashing) with an attack that does 25 slashing damage at initiative 3

Infection:
801 units each with 4706 hit points (weak to radiation) with an attack that does 116 bludgeoning damage at initiative 1
4485 units each with 2961 hit points (immune to radiation; weak to fire, cold) with an attack that does 12 slashing damage at initiative 4`

const EXAMPLE2 = `
Immune System:
76 units each with 3032 hit points with an attack that does 334 radiation damage at initiative 7

Infection:
2026 units each with 11288 hit points (weak to fire, slashing) with an attack that does 10 slashing damage at initiative 13`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE1,
        expected: 5216,
      },
      {
        input: EXAMPLE2,
        expected: 2018,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE1,
        expected: 51,
      },
    ],
  },
} as AdventOfCodeContest
