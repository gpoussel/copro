# 🎮 CodinGame Puzzle - rubik
# https://www.codingame.com/training/medium/rubik

my $n = <STDIN>;
chomp $n;
# Visible mini-cubes = all cubes minus the hidden inner cube of side n-2.
my $inner = $n >= 2 ? $n - 2 : 0;
print $n * $n * $n - $inner * $inner * $inner, "\n";
