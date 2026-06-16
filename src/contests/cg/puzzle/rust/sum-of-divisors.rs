// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

fn rl() -> String {
    let mut s = String::new();
    std::io::stdin().read_line(&mut s).unwrap();
    s.trim().to_string()
}

fn main() {
    // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
    // of divisors is sum over d of d * floor(n/d).
    let n: i64 = rl().parse().unwrap();
    let mut total: i64 = 0;
    let mut d: i64 = 1;
    while d <= n {
        total += d * (n / d);
        d += 1;
    }
    println!("{}", total);
}
