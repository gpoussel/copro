# 🎮 CodinGame Puzzle - mirrors
# https://www.codingame.com/training/easy/mirrors

gets
r = gets.split.map(&:to_f)
reflected = 0.0
r.reverse_each do |ri|
  denom = 1 - ri * reflected
  reflected = ri + (denom == 0 ? 0 : ((1 - ri) * (1 - ri) * reflected) / denom)
end
puts format("%.4f", reflected)
