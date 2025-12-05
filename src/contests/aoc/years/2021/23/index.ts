import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎄 Advent of Code 2021 - Day 23

// Amphipod types: A=0, B=1, C=2, D=3
// Energy costs: A=1, B=10, C=100, D=1000
const ENERGY_COSTS = [1, 10, 100, 1000]

// Hallway positions (indices 0-10)
// Rooms are at hallway positions 2, 4, 6, 8 (but amphipods can't stop there)
// Valid hallway stopping positions: 0, 1, 3, 5, 7, 9, 10
const HALLWAY_STOPS = [0, 1, 3, 5, 7, 9, 10]
const ROOM_ENTRANCES = [2, 4, 6, 8] // Hallway positions above rooms

interface State {
  hallway: (number | null)[] // 11 positions, null = empty, 0-3 = amphipod type
  rooms: (number | null)[][] // 4 rooms, each with depth positions (top to bottom)
}

function parseInput(input: string, roomDepth: number): State {
  const matches = input.matchAll(/[A-D]/g)
  const letters: number[] = []
  for (const match of matches) {
    letters.push(match[0].charCodeAt(0) - "A".charCodeAt(0))
  }

  // Initialize state
  const hallway: (number | null)[] = Array(11).fill(null)
  const rooms: (number | null)[][] = [[], [], [], []]

  // Fill rooms from the parsed letters
  // Letters are in order: top row left to right, then bottom row left to right
  for (let depth = 0; depth < roomDepth; depth++) {
    for (let room = 0; room < 4; room++) {
      rooms[room].push(letters[depth * 4 + room])
    }
  }

  return { hallway, rooms }
}

function stateKey(state: State): string {
  const hallwayStr = state.hallway.map(h => (h === null ? "." : String(h))).join("")
  const roomsStr = state.rooms.map(room => room.map(r => (r === null ? "." : String(r))).join("")).join("|")
  return `${hallwayStr}:${roomsStr}`
}

function statesEqual(a: State, b: State): boolean {
  return stateKey(a) === stateKey(b)
}

function cloneState(state: State): State {
  return {
    hallway: [...state.hallway],
    rooms: state.rooms.map(room => [...room]),
  }
}

function isGoal(state: State): boolean {
  // All amphipods must be in their destination rooms
  for (let room = 0; room < 4; room++) {
    for (const amphipod of state.rooms[room]) {
      if (amphipod !== room) return false
    }
  }
  return true
}

function isHallwayClear(state: State, from: number, to: number): boolean {
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  for (let i = start; i <= end; i++) {
    if (state.hallway[i] !== null) return false
  }
  return true
}

function getMoves(state: State): { to: State; cost: number }[] {
  const moves: { to: State; cost: number }[] = []
  const roomDepth = state.rooms[0].length

  // 1. Try moving amphipods from hallway into their destination room
  for (let hallwayPos = 0; hallwayPos < 11; hallwayPos++) {
    const amphipod = state.hallway[hallwayPos]
    if (amphipod === null) continue

    const destRoom = amphipod
    const destRoomEntrance = ROOM_ENTRANCES[destRoom]

    // Check if room is ready to accept this amphipod
    // (empty or only contains same type amphipods)
    const room = state.rooms[destRoom]
    const canEnter = room.every(a => a === null || a === amphipod)
    if (!canEnter) continue

    // Check if hallway path is clear (excluding current position)
    const pathStart = hallwayPos < destRoomEntrance ? hallwayPos + 1 : destRoomEntrance
    const pathEnd = hallwayPos < destRoomEntrance ? destRoomEntrance : hallwayPos - 1
    if (!isHallwayClear(state, pathStart, pathEnd)) continue

    // Find the deepest empty spot in the room
    let targetDepth = -1
    for (let d = roomDepth - 1; d >= 0; d--) {
      if (room[d] === null) {
        targetDepth = d
        break
      }
    }
    if (targetDepth === -1) continue

    // Calculate cost: hallway distance + room depth + 1
    const hallwayDist = Math.abs(hallwayPos - destRoomEntrance)
    const cost = (hallwayDist + targetDepth + 1) * ENERGY_COSTS[amphipod]

    const newState = cloneState(state)
    newState.hallway[hallwayPos] = null
    newState.rooms[destRoom][targetDepth] = amphipod
    moves.push({ to: newState, cost })
  }

  // 2. Try moving amphipods from rooms into hallway
  for (let roomIdx = 0; roomIdx < 4; roomIdx++) {
    const room = state.rooms[roomIdx]

    // Find the topmost amphipod in this room
    let topDepth = -1
    for (let d = 0; d < roomDepth; d++) {
      if (room[d] !== null) {
        topDepth = d
        break
      }
    }
    if (topDepth === -1) continue // Room is empty

    const amphipod = room[topDepth]!

    // Check if this amphipod needs to move
    // It should stay if it's in its destination room AND all below are also correct
    if (roomIdx === amphipod) {
      let allCorrect = true
      for (let d = topDepth; d < roomDepth; d++) {
        if (room[d] !== roomIdx) {
          allCorrect = false
          break
        }
      }
      if (allCorrect) continue // No need to move
    }

    const roomEntrance = ROOM_ENTRANCES[roomIdx]

    // Try all valid hallway stops
    for (const hallwayStop of HALLWAY_STOPS) {
      // Check if hallway path is clear
      const pathStart = Math.min(roomEntrance, hallwayStop)
      const pathEnd = Math.max(roomEntrance, hallwayStop)
      if (!isHallwayClear(state, pathStart, pathEnd)) continue

      // Calculate cost: room depth + 1 + hallway distance
      const hallwayDist = Math.abs(roomEntrance - hallwayStop)
      const cost = (topDepth + 1 + hallwayDist) * ENERGY_COSTS[amphipod]

      const newState = cloneState(state)
      newState.rooms[roomIdx][topDepth] = null
      newState.hallway[hallwayStop] = amphipod
      moves.push({ to: newState, cost })
    }
  }

  return moves
}

function solve(initialState: State): number {
  const result = utils.algo.dijkstraOnGraph<State>([initialState], isGoal, {
    key: stateKey,
    equals: statesEqual,
    moves: state => getMoves(state),
  })
  return result.bestScore
}

function part1(inputString: string) {
  const state = parseInput(inputString, 2)
  return solve(state)
}

function part2(inputString: string) {
  const lines = utils.input.lines(inputString)
  const extraLines = ["  #D#C#B#A#", "  #D#B#A#C#"]
  const newLines = [...lines.slice(0, 3), extraLines[0], extraLines[1], ...lines.slice(3)]
  const newInput = newLines.join("\n")
  const state = parseInput(newInput, 4)
  return solve(state)
}

const EXAMPLE = `
#############
#...........#
###B#C#B#D###
  #A#D#C#A#
  #########`

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: EXAMPLE,
        expected: 12521,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: EXAMPLE,
        expected: 44169,
      },
    ],
  },
} as AdventOfCodeContest
