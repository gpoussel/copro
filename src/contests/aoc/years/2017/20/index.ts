import { AdventOfCodeContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector3 } from "../../../../../utils/vector.js"

// 🎄 Advent of Code 2017 - Day 20

function parseInput(input: string) {
  return utils.input.lines(input).map(line => {
    const [p, v, a] = line.split(", ").map(part => {
      const [x, y, z] = part.slice(3, -1).split(",").map(Number)
      return new Vector3(x, y, z)
    })
    return { p, v, a }
  })
}

function part1(inputString: string) {
  const particles = parseInput(inputString)
  for (let i = 0; i < 1000; ++i) {
    particles.forEach(particle => {
      particle.v = particle.v.add(particle.a)
      particle.p = particle.p.add(particle.v)
    })
  }
  const distances = particles.map(particle => particle.p.manhattanDistance(new Vector3(0, 0, 0)))
  const minDistance = utils.iterate.min(distances)
  const indexOfMinDistance = distances.indexOf(minDistance)
  return indexOfMinDistance
}

function part2(inputString: string) {
  const particles = parseInput(inputString)
  for (let i = 0; i < 1000; ++i) {
    particles.forEach(particle => {
      particle.v = particle.v.add(particle.a)
      particle.p = particle.p.add(particle.v)
    })
    const particlesByPosition = utils.iterate.mapBy(particles, particle => particle.p.str())
    for (const [, particlesAtPosition] of particlesByPosition) {
      if (particlesAtPosition.length > 1) {
        particlesAtPosition.forEach(p => {
          const index = particles.indexOf(p)
          if (index !== -1) {
            particles.splice(index, 1)
          }
        })
      }
    }
  }
  return particles.length
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
p=< 3,0,0>, v=< 2,0,0>, a=<-1,0,0>
p=< 4,0,0>, v=< 0,0,0>, a=<-2,0,0>`,
        expected: 0,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
p=<-6,0,0>, v=< 3,0,0>, a=< 0,0,0>
p=<-4,0,0>, v=< 2,0,0>, a=< 0,0,0>
p=<-2,0,0>, v=< 1,0,0>, a=< 0,0,0>
p=< 3,0,0>, v=<-1,0,0>, a=< 0,0,0>`,
        expected: 1,
      },
    ],
  },
} as AdventOfCodeContest
