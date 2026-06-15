# 🎮 CodinGame Puzzle - google-interview---the-two-egg-problem
# https://www.codingame.com/training/hard/google-interview---the-two-egg-problem

n = gets.to_i
k = 0
k += 1 while k * (k + 1) / 2 < n
puts k
