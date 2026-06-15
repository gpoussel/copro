# 🎮 CodinGame Puzzle - max-area
# https://www.codingame.com/training/easy/max-area

gets
a = gets.split.map(&:to_i)
left = 0
right = a.length - 1
best = 0
while left < right
  height = [a[left], a[right]].min
  area = height * (right - left)
  best = area if area > best
  if a[left] < a[right]
    left += 1
  else
    right -= 1
  end
end
puts best
