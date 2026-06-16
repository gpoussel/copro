# 🎮 CodinGame Puzzle - sum-of-divisors
# https://www.codingame.com/training/medium/sum-of-divisors

# d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
# of divisors is sum over d of d * floor(n/d).
n = gets.to_i
total = 0
(1..n).each { |d| total += d * (n / d) }
puts total
