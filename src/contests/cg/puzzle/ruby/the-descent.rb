# 🎮 CodinGame Puzzle - the-descent
# https://www.codingame.com/training/easy/the-descent

# Game loop: each turn, read 8 mountain heights and fire on the tallest one.
STDOUT.sync = true
loop do
  max_height = -1
  max_index = 0
  8.times do |i|
    h = gets.to_i
    if h > max_height
      max_height = h
      max_index = i
    end
  end
  puts max_index
end
