# 🎮 CodinGame Puzzle - fibonaccis-rabbit
# https://www.codingame.com/training/easy/fibonaccis-rabbit

f0, n = gets.split.map(&:to_i)
a, b = gets.split.map(&:to_i)
f = Array.new(n + 1, 0)
f[0] = f0
(1..n).each do |i|
  total = 0
  (a..b).each do |k|
    total += f[i - k] if i - k >= 0
  end
  f[i] = total
end
puts f[n]
