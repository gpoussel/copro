# 🎮 CodinGame Puzzle - the-fastest
# https://www.codingame.com/training/medium/the-fastest

# Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
my $n = <STDIN>;
chomp $n;
my $best = "";
for (1 .. $n) {
    my $t = <STDIN>;
    $t =~ s/\s+$//;
    $best = $t if ($best eq "" || $t lt $best);
}
print "$best\n";
