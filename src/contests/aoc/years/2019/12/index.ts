import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2019 - Day 12

interface Moon {
  position: Vector3
  velocity: Vector3
}

function parseInput(input: string): Moon[] {
  return utils.input.lines(input).map(line => {
    const [x, y, z] = line
      .replace(/[<>\sxyz=]/g, "")
      .split(",")
      .map(Number)
    return {
      position: new Vector3(x, y, z),
      velocity: new Vector3(0, 0, 0),
    }
  })
}

function applyGravity(moon1: Moon, moon2: Moon) {
  let velocityDiffX = Math.sign(moon2.position.x - moon1.position.x)
  let velocityDiffY = Math.sign(moon2.position.y - moon1.position.y)
  let velocityDiffZ = Math.sign(moon2.position.z - moon1.position.z)
  moon1.velocity = moon1.velocity.add(new Vector3(velocityDiffX, velocityDiffY, velocityDiffZ))
  moon2.velocity = moon2.velocity.subtract(new Vector3(velocityDiffX, velocityDiffY, velocityDiffZ))
}
function applyVelocity(moon: Moon) {
  moon.position = moon.position.add(moon.velocity)
}

function getPotentialEnergy(moon: Moon) {
  return Math.abs(moon.position.x) + Math.abs(moon.position.y) + Math.abs(moon.position.z)
}

function getKineticEnergy(moon: Moon) {
  return Math.abs(moon.velocity.x) + Math.abs(moon.velocity.y) + Math.abs(moon.velocity.z)
}

function getTotalEnergy(moon: Moon) {
  return getPotentialEnergy(moon) * getKineticEnergy(moon)
}

function getEnergy(moons: Moon[]) {
  return moons.map(getTotalEnergy).reduce((a, b) => a + b, 0)
}

function simulateSystem(moons: Moon[]) {
  for (let i = 0; i < moons.length; ++i) {
    for (let j = i + 1; j < moons.length; ++j) {
      const moon1 = moons[i]
      const moon2 = moons[j]
      applyGravity(moon1, moon2)
    }
  }
  for (const moon of moons) {
    applyVelocity(moon)
  }
}

function part1(inputString: string) {
  const moons = parseInput(inputString)
  for (let time = 0; time < 1000; ++time) {
    simulateSystem(moons)
  }
  return getEnergy(moons)
}

function part2(inputString: string) {
  const moons = parseInput(inputString)
  // Each axis can be solved independently (i.e. finding the period)
  const states = {
    x: new Set<string>(),
    y: new Set<string>(),
    z: new Set<string>(),
  }
  const loopsEncountered = {
    x: false,
    y: false,
    z: false,
  }
  while (!loopsEncountered.x || !loopsEncountered.y || !loopsEncountered.z) {
    simulateSystem(moons)
    for (const axis of ["x", "y", "z"] as const) {
      const stateKey = moons.map(moon => `${moon.position[axis]},${moon.velocity[axis]}`).join(",")
      if (!loopsEncountered[axis] && states[axis].has(stateKey)) {
        loopsEncountered[axis] = true
      }
      states[axis].add(stateKey)
    }
  }
  // Result is the LCM of the periods of each axis
  return utils.math.lcm(states.x.size, states.y.size, states.z.size)
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`,
        expected: 183,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
<x=-1, y=0, z=2>
<x=2, y=-10, z=-7>
<x=4, y=-8, z=8>
<x=3, y=5, z=-1>`,
        expected: 2772,
      },
      {
        input: `
<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`,
        expected: 4686774924,
      },
    ],
  },
} as AdventOfCodeContest
