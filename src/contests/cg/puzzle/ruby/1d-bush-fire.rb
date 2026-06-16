# 🎮 CodinGame Puzzle - 1d-bush-fire
# https://www.codingame.com/training/easy/1d-bush-fire

n = gets.to_i
n.times do
  strip = gets.chomp
  drops = 0
  j = 0
  while j < strip.length
    if strip[j] == "f"
      # Drop at j covers j, j+1, j+2 — skip past all 3.
      drops += 1
      j += 3
    else
      j += 1
    end
  end
  puts drops
end
