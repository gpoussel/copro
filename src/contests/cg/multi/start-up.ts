// 🎮 CodinGame Multiplayer - start-up
// https://www.codingame.com/multiplayer/bot-programming/start-up
//
// 4 start-ups, 100 turns, most market share wins. Inputs come one value per
// line. Reputation = 100·features / (3·bugs + fixed bugs), capped at 2000,
// so: reach 20 features while keeping tests high (no bugs once tests ≥
// 4·features), sell from 8 features on (unfilled market first, competitive
// once it is gone), keep 1 manager per 4 employees and a cash reserve.

const DEV_TARGET = 10
const FEATURE_TARGET = 20

while (true) {
  const v: number[] = []
  for (let i = 0; i < 11; i++) v.push(parseInt(readline()))
  const [myId, playerCount, , income, cash, devs, sellers, managers, features, tests, bugs] = v
  let totalShare = 0
  for (let p = 0; p < playerCount; p++) {
    const [, share] = readline().split(" ").map(Number)
    totalShare += share
  }
  void myId

  const wantDevs = features < FEATURE_TARGET ? DEV_TARGET : 2
  const wantSellers = features >= 8 ? Math.max(0, 4 * (managers + 1) - wantDevs) : 0
  const wantManagers = Math.ceil((wantDevs + wantSellers) / 4)
  const cost = (d: number, s: number, m: number) => 10 * (d + s) + 20 * m
  const budgetOk = (d: number, s: number, m: number) => cash + income >= 4 * cost(d, s, m)

  let managersToHire = managers < wantManagers && budgetOk(devs, sellers, managers + 1) ? 1 : 0
  const quota = 2 * managers
  let devsToHire = Math.max(-quota, Math.min(quota, wantDevs - devs))
  let sellersToHire = Math.max(
    -(quota - Math.abs(devsToHire)),
    Math.min(quota - Math.abs(devsToHire), wantSellers - sellers)
  )
  // Stay within control (4 per manager) and the hard cap (10 per manager).
  const cap = 4 * managers
  while (devs + devsToHire + sellers + sellersToHire > cap && sellersToHire > -sellers) sellersToHire--
  while (devs + devsToHire + sellers + sellersToHire > cap && devsToHire > -devs) devsToHire--
  // Money: shrink the hires until the budget holds.
  while (sellersToHire > 0 && !budgetOk(devs + devsToHire, sellers + sellersToHire, managers + managersToHire))
    sellersToHire--
  while (devsToHire > 0 && !budgetOk(devs + devsToHire, sellers + sellersToHire, managers + managersToHire))
    devsToHire--
  if (!budgetOk(devs + devsToHire, sellers + sellersToHire, managers)) managersToHire = 0

  const d = devs + devsToHire
  const s = sellers + sellersToHire
  // Developers: one in five on features, the others on tests, so tests stay
  // ≥ 4·features and no bug ever appears (a fixed bug hurts reputation
  // forever, and stealing market share needs a reputation ≥ the victim's).
  let onFeatures = features < FEATURE_TARGET ? Math.max(d > 0 ? 1 : 0, Math.floor(d / 5)) : 0
  if (tests < 4 * (features + onFeatures) - 4 * d) onFeatures = Math.max(0, onFeatures - 1)
  if (bugs > 0) onFeatures = Math.min(onFeatures, Math.max(0, d - bugs))
  const maintenance = d - onFeatures
  // Sellers: unfilled market while it lasts (shares are in thousandths).
  const competitive = totalShare >= 950 ? s : 0
  console.log(`${devsToHire} ${sellersToHire} ${managersToHire} ${maintenance} ${competitive}`)
}
