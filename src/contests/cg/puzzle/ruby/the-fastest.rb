# 🎮 CodinGame Puzzle - the-fastest
# https://www.codingame.com/training/medium/the-fastest

# Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
n = gets.to_i
best = ""
n.times do
  t = gets.strip
  best = t if best == "" || t < best
end
puts best
