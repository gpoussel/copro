// 🎮 CodinGame Puzzle - the-river-i-
// https://www.codingame.com/training/easy/the-river-i-

import java.io.*;

class Solution {
    static long digitSum(long x) {
        long s = 0;
        while (x > 0) {
            s += x % 10;
            x /= 10;
        }
        return s;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        long a = Long.parseLong(br.readLine().trim());
        long b = Long.parseLong(br.readLine().trim());
        while (a != b) {
            if (a < b) a += digitSum(a);
            else b += digitSum(b);
        }
        System.out.println(a);
    }
}
