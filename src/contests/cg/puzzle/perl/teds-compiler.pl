# 🎮 CodinGame Puzzle - teds-compiler
# https://www.codingame.com/training/easy/teds-compiler

my $line = <STDIN>;
$line =~ s/\s+$//;
my $balance = 0;
my $best = 0;
my @c = split //, $line;
for my $i (0 .. $#c) {
    if ($c[$i] eq '<') {
        $balance++;
    } else {
        $balance--;
    }
    last if $balance < 0;
    $best = $i + 1 if $balance == 0;
}
print "$best\n";
