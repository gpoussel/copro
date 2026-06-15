# 🎮 CodinGame Puzzle - horse-racing-duals
# https://www.codingame.com/training/easy/horse-racing-duals

n = gets.to_i
strengths = Array.new(n) { gets.to_i }.sort
min_diff = Float::INFINITY
(1...strengths.length).each do |i|
  diff = strengths[i] - strengths[i - 1]
  min_diff = diff if diff < min_diff
end
puts min_diff
