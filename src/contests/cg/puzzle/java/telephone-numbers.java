// 🎮 CodinGame Puzzle - telephone-numbers
// https://www.codingame.com/training/medium/telephone-numbers

import java.io.*;
import java.util.*;

class Solution {
    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        Map<Character, Object> root = new HashMap<>();
        int cable = 0;
        for (int i = 0; i < n; i++) {
            String number = br.readLine().trim();
            Map<Character, Object> node = root;
            for (char d : number.toCharArray()) {
                if (!node.containsKey(d)) {
                    node.put(d, new HashMap<Character, Object>());
                    cable++;
                }
                node = (Map<Character, Object>) node.get(d);
            }
        }
        System.out.println(cable);
    }
}
