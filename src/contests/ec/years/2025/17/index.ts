import { EverybodyCodesContest } from "../../../../../types/contest.js"
import utils from "../../../../../utils/index.js"
import { Vector2 } from "../../../../../utils/vector.js"
import { PriorityQueue } from "../../../../../utils/structures/priority-queue.js"

// 🎲 Everybody Codes 2025 - Quest 17

function parseInput(input: string) {
  return utils.input.readGrid(input).map(row => row.map(v => (v === "@" ? 0 : Number(v))))
}

function part1(inputString: string) {
  const grid = parseInput(inputString)
  const rows = grid.length
  const cols = grid[0].length
  const center = new Vector2(Math.floor(cols / 2), Math.floor(rows / 2))
  let sum = 0
  utils.grid.iterate(grid, (item, x, y) => {
    const pos = new Vector2(x, y)
    const dist = pos.euclideanDistance(center)
    if (dist <= 10) {
      sum += item
    } else {
      utils.grid.set(grid, pos, 0)
    }
  })
  return sum
}

function part2(inputString: string) {
  const grid = parseInput(inputString)
  const rows = grid.length
  const cols = grid[0].length
  const center = new Vector2(Math.floor(cols / 2), Math.floor(rows / 2))
  const sumsByRadius: number[] = []
  let radius = 1
  let reachedEdge = false
  const maxSafety = Math.max(rows, cols) * 2
  while (!reachedEdge && radius <= maxSafety) {
    let sum = 0
    let touchedEdge = false
    for (let dx = -radius; dx <= radius; ++dx) {
      for (let dy = -radius; dy <= radius; ++dy) {
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (!(dist > radius - 1 && dist <= radius)) continue
        const pos = new Vector2(center.x + dx, center.y + dy)
        if (utils.grid.inBounds(grid, pos)) {
          sum += utils.grid.at(grid, pos)
          if (pos.x === 0 || pos.y === 0 || pos.x === cols - 1 || pos.y === rows - 1) {
            touchedEdge = true
          }
        }
      }
    }
    sumsByRadius.push(sum)
    if (touchedEdge) reachedEdge = true
    ++radius
  }

  // find best radius (1-based index) with maximum destruction
  let bestSum = 0
  let bestRadius = 0
  for (let i = 0; i < sumsByRadius.length; ++i) {
    if (sumsByRadius[i] > bestSum) {
      bestSum = sumsByRadius[i]
      bestRadius = i + 1
    }
  }
  return bestRadius * bestSum
}

function part3(inputString: string) {
  const G = utils.input.readGrid(inputString)
  const R = G.length
  const C = G[0].length

  let vr = 0,
    vc = 0
  let sr = 0,
    sc = 0

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (G[r][c] === "@") {
        vr = r
        vc = c
      } else if (G[r][c] === "S") {
        sr = r
        sc = c
      } else {
        G[r][c] = G[r][c]
      }
    }
  }

  G[sr][sc] = "0"
  function bfs(start: [number, number], rad: number, go_left: boolean): Map<string, number> {
    const D = new Map<string, number>()
    const Q = new PriorityQueue<[number, number, number]>(a => a[0], PriorityQueue.MIN_HEAP_COMPARATOR)

    Q.add([0, start[0], start[1]])

    while (Q.size() > 0) {
      const popped = Q.poll()
      if (!popped) {
        break
      }
      const [d, r, c] = popped

      if (!(0 <= r && r < R && 0 <= c && c < C)) {
        continue
      }
      if ((r - vr) ** 2 + (c - vc) ** 2 <= rad ** 2) {
        continue
      }
      if (r === vr && ((go_left && c > vc) || (!go_left && c < vc))) {
        continue
      }

      const key = `${r},${c}`
      if (D.has(key)) {
        continue
      }

      D.set(key, d)

      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nr = r + dr
        const nc = c + dc
        const cost = +G[r][c] as number
        Q.add([d + cost, nr, nc])
      }
    }
    return D
  }

  // --- main logic ---
  for (let rad = 0; rad < 1000; rad++) {
    const timeLimit = (rad + 1) * 30 - 1
    const distanceLeft = bfs([sr, sc], rad, true)
    const distanceRight = bfs([sr, sc], rad, false)

    let score = Infinity
    for (let r = vr + 1; r < R; r++) {
      const key = `${r},${vc}`
      if (distanceLeft.has(key)) {
        const dl = distanceLeft.get(key)!
        const dr = distanceRight.get(key)!
        score = Math.min(score, dl + dr + (+G[r][vc] as number))
      }
    }

    if (score < timeLimit) {
      return rad * score
    }
  }
}

export default {
  part1: {
    run: part1,
    tests: [
      {
        input: `
189482189843433862719
279415473483436249988
432746714658787816631
428219317375373724944
938163982835287292238
627369424372196193484
539825864246487765271
517475755641128575965
685934212385479112825
815992793826881115341
1737798467@7983146242
867597735651751839244
868364647534879928345
519348954366296559425
134425275832833829382
764324337429656245499
654662236199275446914
317179356373398118618
542673939694417586329
987342622289291613318
971977649141188759131`,
        expected: 1573,
      },
    ],
  },
  part2: {
    run: part2,
    tests: [
      {
        input: `
4547488458944
9786999467759
6969499575989
7775645848998
6659696497857
5569777444746
968586@767979
6476956899989
5659745697598
6874989897744
6479994574886
6694118785585
9568991647449`,
        expected: 1090,
      },
    ],
  },
  part3: {
    run: part3,
    tests: [
      {
        input: `
2645233S5466644
634566343252465
353336645243246
233343552544555
225243326235365
536334634462246
666344656233244
6426432@2366453
364346442652235
253652463426433
426666225623563
555462553462364
346225464436334
643362324542432
463332353552464`,
        expected: 592,
      },
      {
        input: `
545233443422255434324
5222533434S2322342222
523444354223232542432
553522225435232255242
232343243532432452524
245245322252324442542
252533232225244224355
523533554454232553332
522332223232242523223
524523432425432244432
3532242243@4323422334
542524223994422443222
252343244322522222332
253355425454255523242
344324325233443552555
423523225325255345522
244333345244325322335
242244352245522323422
443332352222535334325
323532222353523253542
553545434425235223552`,
        expected: 330,
      },
      {
        input: `
5441525241225111112253553251553
133522122534119S911411222155114
3445445533355599933443455544333
3345333555434334535435433335533
5353333345335554434535533555354
3533533435355443543433453355553
3553353435335554334453355435433
5435355533533355533535335345335
4353545353545354555534334453353
4454543553533544443353355553453
5334554534533355333355543533454
4433333345445354553533554555533
5554454343455334355445533453453
4435554534445553335434455334353
3533435453433535345355533545555
534433533533535@353533355553345
4453545555435334544453344455554
4353333535535354535353353535355
4345444453554554535355345343354
3534544535533355333333445433555
3535333335335334333534553543535
5433355333553344355555344553435
5355535355535334555435534555344
3355433335553553535334544544333
3554333535553335343555345553535
3554433545353554334554345343343
5533353435533535333355343333555
5355555353355553535354333535355
4344534353535455333455353335333
5444333535533453535335454535553
3534343355355355553543545553345`,
        expected: 3180,
      },
    ],
  },
} as EverybodyCodesContest
