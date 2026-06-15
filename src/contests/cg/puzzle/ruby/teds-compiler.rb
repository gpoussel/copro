# 🎮 CodinGame Puzzle - teds-compiler
# https://www.codingame.com/training/easy/teds-compiler

line = gets.chomp
balance = 0
best = 0
line.chars.each_with_index do |c, i|
  if c == "<"
    balance += 1
  else
    balance -= 1
  end
  break if balance < 0
  best = i + 1 if balance == 0
end
puts best
