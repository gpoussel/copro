// 🎮 CodinGame Puzzle - euclids-algorithm
// https://www.codingame.com/training/easy/euclids-algorithm

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] p = br.readLine().trim().split(" ");
        long a = Long.parseLong(p[0]), b = Long.parseLong(p[1]);
        long x = a, y = b;
        while (y != 0) {
            long q = x / y, r = x % y;
            System.out.println(x + "=" + y + "*" + q + "+" + r);
            x = y;
            y = r;
        }
        System.out.println("GCD(" + a + "," + b + ")=" + x);
    }
}
