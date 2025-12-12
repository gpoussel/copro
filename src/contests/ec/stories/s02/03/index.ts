import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"

// 🎲 Everybody Codes Story 2 - Quest 3

class Die {
  faces: number[]
  seed: bigint
  pulse: bigint
  roll_number: bigint
  current_face_index: bigint

  constructor(faces: number[], seed: number) {
    this.faces = faces
    this.seed = BigInt(seed)
    this.pulse = BigInt(seed)
    this.roll_number = 1n
    this.current_face_index = 0n
  }

  clone(): Die {
    const newDie = new Die(this.faces, Number(this.seed))
    newDie.pulse = this.pulse
    newDie.roll_number = this.roll_number
    newDie.current_face_index = this.current_face_index
    return newDie
  }

  roll(): number {
    const spin = this.roll_number * this.pulse

    const faces_length = BigInt(this.faces.length)
    const next_face_index_bigint = (this.current_face_index + spin) % faces_length

    const next_face_index = Number(next_face_index_bigint)
    const result = this.faces[next_face_index]
    this.current_face_index = next_face_index_bigint

    this.pulse += spin
    this.pulse %= this.seed
    this.pulse += 1n + this.roll_number + this.seed

    this.roll_number++

    return result
  }
}

function parsePart1Input(input: string) {
  return utils.input.lines(input).map(line => {
    const match = line.match(/\d+: faces=\[(.*?)\] seed=(\d+)/)
    if (!match) throw new Error(`Invalid input line: ${line}`)
    const faces = match[1].split(",").map(Number)
    const seed = parseInt(match[2], 10)
    return new Die(faces, seed)
  })
}

function part1(inputString: string) {
  const dice = parsePart1Input(inputString)
  let totalPoints = 0
  let rollCount = 0
  const GOAL = 10000

  while (totalPoints < GOAL) {
    rollCount++
    let currentRollPoints = 0
    for (const die of dice) {
      currentRollPoints += die.roll()
    }
    totalPoints += currentRollPoints
  }

  return rollCount
}

interface Player {
  id: number
  die: Die
  position: number
}

const parsePart2Input = (input: string): { track: number[]; players: Player[] } => {
  const lines = utils.input.lines(input)
  const trackLine = lines[lines.length - 1]
  const track = trackLine.split("").map(Number)
  const players: Player[] = []

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i]
    if (line.trim() === "") continue

    const idMatch = line.match(/^(\d+):/)
    if (!idMatch) continue
    const id = parseInt(idMatch[1], 10)

    const match = line.match(/: faces=\[(.*?)\] seed=(\d+)/)
    if (!match) throw new Error(`Invalid input line: ${line}`)

    const faces = match[1].split(",").map(Number)
    const seed = parseInt(match[2], 10)

    players.push({
      id,
      die: new Die(faces, seed),
      position: 0,
    })
  }

  return { track, players }
}

function part2(inputString: string) {
  const { track, players } = parsePart2Input(inputString)
  const trackLength = track.length

  const finishedOrder: number[] = []
  let activePlayers = [...players]

  while (activePlayers.length > 0) {
    const playersStillInRace = []

    for (const player of activePlayers) {
      const currentTrackValue = track[player.position]
      const rollValue = player.die.roll()

      let playerFinishedThisTurn = false
      if (rollValue === currentTrackValue) {
        player.position++
        if (player.position >= trackLength) {
          finishedOrder.push(player.id)
          playerFinishedThisTurn = true
        }
      }

      if (!playerFinishedThisTurn) {
        playersStillInRace.push(player)
      }
    }

    activePlayers = playersStillInRace
  }

  return finishedOrder.join(",")
}

function parsePart3Input(input: string): { dice: Die[]; grid: number[][] } {
  const lines = utils.input.lines(input)
  const grid: number[][] = []
  const dice: Die[] = []
  let parsingGrid = false

  for (const line of lines) {
    if (line.trim() === "") {
      parsingGrid = true
      continue
    }

    if (parsingGrid) {
      grid.push(line.split("").map(Number))
    } else {
      const match = line.match(/\d+: faces=\[(.*?)\] seed=(\d+)/)
      if (match) {
        const faces = match[1].split(",").map(Number)
        const seed = parseInt(match[2], 10)
        dice.push(new Die(faces, seed))
      }
    }
  }
  return { dice, grid }
}

function part3(inputString: string): number {
  const { dice, grid } = parsePart3Input(inputString)
  const rows = grid.length
  if (rows === 0) return 0
  const cols = grid[0].length
  if (cols === 0) return 0

  const N = rows * cols
  const idx = (r: number, c: number) => r * cols + c
  const neighbors: number[][] = Array.from({ length: N }, () => [])
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = idx(r, c)
      const deltas = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]
      for (const [dr, dc] of deltas) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) neighbors[id].push(idx(nr, nc))
      }
    }
  }

  // flatten grid to numeric values (1..9)
  const gridVals = new Array<number>(N)
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) gridVals[idx(r, c)] = grid[r][c]

  const seen = new Uint32Array(N)
  let version = 0

  for (const die of dice) {
    const first = die.roll()
    version++
    const todo: number[] = []
    const next: number[] = []

    for (let i = 0; i < N; i++) {
      if (gridVals[i] === first) {
        todo.push(i)
        seen[i] = version
      }
    }

    while (todo.length > 0) {
      const roll = die.roll()
      version++

      for (const point of todo) {
        if (gridVals[point] === roll && seen[point] !== version) {
          next.push(point)
          seen[point] = version
        }

        for (const nb of neighbors[point]) {
          if (gridVals[nb] === roll && seen[nb] !== version) {
            next.push(nb)
            seen[nb] = version
          }
        }
      }

      // swap todo and next
      todo.length = 0
      for (const p of next) todo.push(p)
      next.length = 0
    }
  }

  let count = 0
  for (let i = 0; i < N; i++) if (seen[i] > 0) count++
  return count
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
1: faces=[1,2,3,4,5,6] seed=7
2: faces=[-1,1,-1,1,-1] seed=13
3: faces=[9,8,7,8,9] seed=17`,
        expected: 844,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
1: faces=[1,2,3,4,5,6,7,8,9] seed=13
2: faces=[1,2,3,4,5,6,7,8,9] seed=29
3: faces=[1,2,3,4,5,6,7,8,9] seed=37
4: faces=[1,2,3,4,5,6,7,8,9] seed=43

51257284`,
        expected: "1,3,4,2",
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
1: faces=[1,2,3,4,5,6,7,8,9] seed=13

1523758297
4822941583
7627997892
4397697132
1799773472`,
        expected: 33,
      },
      {
        input: `
1: faces=[1,2,3,4,5,6,7,8,9] seed=339211
2: faces=[1,2,3,4,5,6,7,8,9] seed=339517
3: faces=[1,2,3,4,5,6,7,8,9] seed=339769
4: faces=[1,2,3,4,5,6,7,8,9] seed=339049
5: faces=[1,2,3,4,5,6,7,8,9] seed=338959
6: faces=[1,2,3,4,5,6,7,8,9] seed=340111
7: faces=[1,2,3,4,5,6,7,8,9] seed=339679
8: faces=[1,2,3,4,5,6,7,8,9] seed=339121
9: faces=[1,2,3,4,5,6,7,8,9] seed=338851

94129478611916584144567479397512595367821487689499329543245932151
45326719759656232865938673559697851227323497148536117267854241288
44425936468288462848395149959678842215853561564389485413422813386
64558359733811767982282485122488769592428259771817485135798694145
17145764554656647599363636643624443394141749674594439266267914738
89687344812176758317288229174788352467288242171125512646356965953
72436836424726621961424876248346712363842529736689287535527512173
18295771348356417112646514812963612341591986162693455745689374361
56445661964557624561727322332461348422854112571195242864151143533
77537797151985578367895335725777225518396231453691496787716283477
37666899356978497489345173784484282858559847597424967325966961183
26423131974661694562195955939964966722352323745667498767153191712
99821139398463125478734415536932821142852955688669975837535594682
17768265895455681847771319336534851247125295119363323122744953158
25655579913247189643736314385964221584784477663153155222414634387
62881693835262899543396571369125158422922821541597516885389448546
71751114798332662666694134456689735288947441583123159231519473489
94932859392146885633942828174712588132581248183339538341386944937
53828883514868969493559487848248847169557825166338328352792866332
54329673374115668178556175692459528276819221245996289611868492731
97799599164121988455613343238811122469229423272696867686953891233
56249752581283778997317243845187615584225693829653495119532543712
39171354221177772498317826968247939792845866251456175433557619425
56425749216121421458547849142439211299266255482219915528173596421
48679971256541851497913572722857258171788611888347747362797259539
32676924489943265499379145361515824954991343541956993467914114579
45733396847369746189956225365375253819969643711633873473662833395
42291594527499443926636288241672629499242134451937866578992236427
47615394883193571183931424851238451485822477158595936634849167455
16742896921499963113544858716552428241241973653655714294517865841
57496921774277833341488566199458567884285639693339942468585269698
22734249697451127789698862596688824444191118289959746248348491792
28575193613471799766369217455617858422158428235521423695479745656
74234343226976999161289522983885254212712515669681365845434541257
43457237419516813368452247532764649744546181229533942414983335895`,
        expected: 1125,
      },
    ],
  },
} as EverybodyCodesContest
