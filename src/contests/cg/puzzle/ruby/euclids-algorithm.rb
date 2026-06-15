# 🎮 CodinGame Puzzle - euclids-algorithm
# https://www.codingame.com/training/easy/euclids-algorithm

a, b = gets.split.map(&:to_i)
x, y = a, b
while y != 0
  q = x / y
  r = x % y
  puts "#{x}=#{y}*#{q}+#{r}"
  x, y = y, r
end
puts "GCD(#{a},#{b})=#{x}"
