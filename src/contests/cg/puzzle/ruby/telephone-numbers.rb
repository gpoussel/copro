# 🎮 CodinGame Puzzle - telephone-numbers
# https://www.codingame.com/training/medium/telephone-numbers

n = gets.to_i
root = {}
cable_units = 0
n.times do
  number = gets.strip
  node = root
  number.each_char do |digit|
    unless node.key?(digit)
      node[digit] = {}
      cable_units += 1
    end
    node = node[digit]
  end
end
puts cable_units
