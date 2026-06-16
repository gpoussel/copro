// 🎮 CodinGame Puzzle - sum-of-divisors
// https://www.codingame.com/training/medium/sum-of-divisors

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // d appears as a divisor in floor(n/d) of the numbers 1..n, so the total
        // sum of divisors is sum over d of d * floor(n/d).
        long n = Long.parseLong(br.readLine().trim());
        long total = 0;
        for (long d = 1; d <= n; d++) total += d * (n / d);
        System.out.println(total);
    }
}
