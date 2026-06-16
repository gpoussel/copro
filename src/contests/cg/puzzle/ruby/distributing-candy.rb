# 🎮 CodinGame Puzzle - distributing-candy
# https://www.codingame.com/training/easy/distributing-candy

n, m = gets.split.map(&:to_i)
candies = gets.split.map(&:to_i).sort
best = Float::INFINITY
(0..n - m).each do |i|
  diff = candies[i + m - 1] - candies[i]
  best = diff if diff < best
end
puts best
