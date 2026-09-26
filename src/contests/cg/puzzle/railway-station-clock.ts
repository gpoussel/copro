// 🎮 CodinGame Puzzle - railway-station-clock
// https://www.codingame.com/training/medium/railway-station-clock

const DAY = 86400
const ADJUST = 8 * 3600

const [clock, period] = readline().trim().split(" ")
const [hh, mm, ss] = clock.split(":").map(Number)
const observed = ((hh % 12) + (period === "PM" ? 12 : 0)) * 3600 + mm * 60 + ss

// The clock shows 239 seconds for every 240 real seconds since the last 8AM adjustment
const clockElapsed = (observed - ADJUST + DAY) % DAY
const trueElapsed = Math.round((clockElapsed * 240) / 239)
const t = (ADJUST + trueElapsed) % DAY

const h24 = Math.floor(t / 3600)
const h12 = h24 % 12 === 0 ? 12 : h24 % 12
const pad = (v: number): string => (v < 10 ? "0" : "") + v
console.log(`${h12}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)} ${h24 < 12 ? "AM" : "PM"}`)
