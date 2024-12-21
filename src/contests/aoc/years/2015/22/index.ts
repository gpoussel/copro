import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2015 - Day 22

function parseInput(input: string) {
  const lines = utils.input.lines(input)
  return {
    hitPoints: +lines[0].split(": ")[1],
    damage: +lines[1].split(": ")[1],
  }
}

type Effects = {
  name: "Shield" | "Poison" | "Recharge"
  duration: number
}

const SPELLS = [
  { name: "Magic Missile", cost: 53, damage: 4 },
  { name: "Drain", cost: 73, damage: 2, heal: 2 },
  { name: "Shield", cost: 113, duration: 6 },
  { name: "Poison", cost: 173, duration: 6 },
  { name: "Recharge", cost: 229, duration: 5 },
]

interface GameState {
  player: {
    health: number
    mana: number
    effects: Effects[]
  }
  bossHealth: number
  manaSpent: number
  turn: "player" | "boss"
}

function getNextGameStates(gameState: GameState, damageAtStartTurn: number, bossDamage: number): GameState[] {
  const { turn, player, bossHealth, manaSpent } = gameState
  const newPlayerEffects = player.effects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0)
  const poisonDamage = player.effects.find(e => e.name === "Poison") ? 3 : 0
  const nextBossHealth = bossHealth - poisonDamage
  if (nextBossHealth <= 0) {
    return [{ ...gameState, bossHealth: 0 }]
  }
  const rechargeMana = player.effects.find(e => e.name === "Recharge") ? 101 : 0
  const newMana = player.mana + rechargeMana
  if (turn === "player") {
    const possibleSpells = SPELLS.filter(s => s.cost <= newMana).filter(
      s => !newPlayerEffects.some(e => e.name === s.name)
    )

    return possibleSpells.map(spell => {
      return {
        player: {
          health: player.health + (spell.heal || 0) - damageAtStartTurn,
          mana: newMana - spell.cost,
          effects: [
            ...newPlayerEffects,
            ...(spell.duration ? [{ name: spell.name as Effects["name"], duration: spell.duration }] : []),
          ],
        },
        bossHealth: nextBossHealth - (spell.damage || 0),
        manaSpent: manaSpent + spell.cost,
        turn: "boss",
      }
    })
  } else {
    const playerArmor = player.effects.find(e => e.name === "Shield") ? 7 : 0
    return [
      {
        player: {
          health: player.health - Math.max(1, bossDamage - playerArmor),
          mana: newMana,
          effects: newPlayerEffects,
        },
        bossHealth: nextBossHealth,
        manaSpent: manaSpent,
        turn: "player",
      },
    ]
  }
}

function findLowestWinningMana(bossInitialStats: ReturnType<typeof parseInput>, damageAtStartTurn: number) {
  let minMana = Infinity
  utils.algo.breadthFirstSearch<GameState>(
    {
      player: {
        health: 50,
        mana: 500,
        effects: [],
      },
      bossHealth: bossInitialStats.hitPoints,
      manaSpent: 0,
      turn: "player",
    },
    {
      adjacents(node) {
        return getNextGameStates(node, damageAtStartTurn, bossInitialStats.damage)
      },
      ends(node) {
        return node.bossHealth <= 0 || node.player.health <= 0 || node.manaSpent >= minMana
      },
      key(node) {
        return `${node.player.health} ${node.player.mana} ${node.player.effects.map(e => `${e.name}${e.duration}`).join(" ")} ${node.bossHealth} ${node.manaSpent} ${node.turn}`
      },
      visitEnd(node, path) {
        if (node.bossHealth <= 0 && node.player.health > 0 && node.manaSpent < minMana) {
          minMana = node.manaSpent
        }
        return false
      },
    }
  )
  return minMana
}

function part1(inputString: string) {
  const input = parseInput(inputString)
  return findLowestWinningMana(input, 0)
}

function part2(inputString: string) {
  const input = parseInput(inputString)
  return findLowestWinningMana(input, 1)
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
