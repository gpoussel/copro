// 🎮 CodinGame Puzzle - horse-racing-duals
// https://www.codingame.com/training/easy/horse-racing-duals

import java.io.*;
import java.util.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        int[] s = new int[n];
        for (int i = 0; i < n; i++) s[i] = Integer.parseInt(br.readLine().trim());
        Arrays.sort(s);
        int minDiff = Integer.MAX_VALUE;
        for (int i = 1; i < n; i++) {
            int diff = s[i] - s[i - 1];
            if (diff < minDiff) minDiff = diff;
        }
        System.out.println(minDiff);
    }
}
