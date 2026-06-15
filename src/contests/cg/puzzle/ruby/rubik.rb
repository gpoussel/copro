# 🎮 CodinGame Puzzle - rubik
# https://www.codingame.com/training/medium/rubik

n = gets.to_i
# Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
inner = n >= 2 ? n - 2 : 0
puts n**3 - inner**3
