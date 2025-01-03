// 🧮 Project Euler - Problem 97

import { modPow } from "../../../utils/math.js"

export function solve() {
  return (28433n * modPow(2n, 7830457n, 10n ** 10n) + 1n) % 10n ** 10n
}
