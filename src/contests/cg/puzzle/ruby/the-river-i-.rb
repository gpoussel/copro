# 🎮 CodinGame Puzzle - the-river-i-
# https://www.codingame.com/training/easy/the-river-i-

def digit_sum(n)
  s = 0
  while n > 0
    s += n % 10
    n /= 10
  end
  s
end

a = gets.to_i
b = gets.to_i
while a != b
  if a < b
    a += digit_sum(a)
  else
    b += digit_sum(b)
  end
end
puts a
