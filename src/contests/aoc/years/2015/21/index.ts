import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 21

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  return {
    hitPoints: +lines[0].split(": ")[1],
    damage: +lines[1].split(": ")[1],
    armor: +lines[2].split(": ")[1],
  }
}

const INITIAL_PLAYER_HIT_POINTS = 100

const SHOP_ITEMS = {
  weapons: [
    { cost: 8, damage: 4 },
    { cost: 10, damage: 5 },
    { cost: 25, damage: 6 },
    { cost: 40, damage: 7 },
    { cost: 74, damage: 8 },
  ],
  armor: [
    { cost: 13, armor: 1 },
    { cost: 31, armor: 2 },
    { cost: 53, armor: 3 },
    { cost: 75, armor: 4 },
    { cost: 102, armor: 5 },
  ],
  rings: [
    { cost: 25, armor: 0, damage: 1 },
    { cost: 50, armor: 0, damage: 2 },
    { cost: 100, armor: 0, damage: 3 },
    { cost: 20, armor: 1, damage: 0 },
    { cost: 40, armor: 2, damage: 0 },
    { cost: 80, armor: 3, damage: 0 },
  ],
}

interface Character {
  hitPoints: number
  damage: number
  armor: number
}

function simulateFight(player: Character, boss: Character) {
  const playerDamage = Math.max(1, player.damage - boss.armor)
  const bossDamage = Math.max(1, boss.damage - player.armor)
  const playerTurns = Math.ceil(boss.hitPoints / playerDamage)
  const bossTurns = Math.ceil(player.hitPoints / bossDamage)
  return playerTurns <= bossTurns
}

function getChoices() {
  const armorChoices = SHOP_ITEMS.armor.concat({ cost: 0, armor: 0 })
  const ringChoices = [
    // Can buy 0 rings
    { cost: 0, damage: 0, armor: 0 },
    // Can buy 1 ring
    ...SHOP_ITEMS.rings,
    // Can buy 2 rings
    ...SHOP_ITEMS.rings.flatMap((ring1, i) =>
      SHOP_ITEMS.rings.slice(i + 1).map(ring2 => ({
        cost: ring1.cost + ring2.cost,
        damage: ring1.damage + ring2.damage,
        armor: ring1.armor + ring2.armor,
      }))
    ),
  ]
  return { weaponChoices: SHOP_ITEMS.weapons, armorChoices, ringChoices }
}

function getPossiblePlayerLoadouts() {
  const { weaponChoices, armorChoices, ringChoices } = getChoices()
  return weaponChoices.flatMap(weapon =>
    armorChoices.flatMap(armor =>
      ringChoices.map(rings => ({
        cost: weapon.cost + armor.cost + rings.cost,
        damage: weapon.damage + rings.damage,
        armor: armor.armor + rings.armor,
      }))
    )
  )
}

function part1(inputString: string) {
  const boss = parseInput(inputString)

  let minCost = Infinity
  for (const loadout of getPossiblePlayerLoadouts()) {
    if (
      simulateFight(
        {
          hitPoints: INITIAL_PLAYER_HIT_POINTS,
          damage: loadout.damage,
          armor: loadout.armor,
        },
        boss
      )
    ) {
      minCost = Math.min(minCost, loadout.cost)
    }
  }
  return minCost
}

function part2(inputString: string) {
  const boss = parseInput(inputString)

  let maxCost = -Infinity
  for (const loadout of getPossiblePlayerLoadouts()) {
    if (
      !simulateFight(
        {
          hitPoints: INITIAL_PLAYER_HIT_POINTS,
          damage: loadout.damage,
          armor: loadout.armor,
        },
        boss
      )
    ) {
      maxCost = Math.max(maxCost, loadout.cost)
    }
  }
  return maxCost
}

export default {
  part1: {
    run: part1,
    tests: [],
  },
  part2: {
    run: part2,
    tests: [],
  },
} as AdventOfCodeContest
