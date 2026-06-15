// 🎮 CodinGame Puzzle - distributing-candy
// https://www.codingame.com/training/easy/distributing-candy

import java.io.*;
import java.util.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] f = br.readLine().trim().split(" ");
        int n = Integer.parseInt(f[0]), m = Integer.parseInt(f[1]);
        String[] tok = br.readLine().trim().split(" ");
        int[] candies = new int[tok.length];
        for (int i = 0; i < tok.length; i++) candies[i] = Integer.parseInt(tok[i]);
        Arrays.sort(candies);
        int best = Integer.MAX_VALUE;
        for (int i = 0; i + m - 1 < n; i++) {
            int diff = candies[i + m - 1] - candies[i];
            if (diff < best) best = diff;
        }
        System.out.println(best);
    }
}
