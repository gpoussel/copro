// 🎮 CodinGame Puzzle - the-fastest
// https://www.codingame.com/training/medium/the-fastest

import java.io.*;

class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
        int n = Integer.parseInt(br.readLine().trim());
        String best = "";
        for (int i = 0; i < n; i++) {
            String t = br.readLine().trim();
            if (best.equals("") || t.compareTo(best) < 0) best = t;
        }
        System.out.println(best);
    }
}
