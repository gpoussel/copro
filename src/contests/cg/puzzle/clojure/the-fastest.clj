;; 🎮 CodinGame Puzzle - the-fastest
;; https://www.codingame.com/training/medium/the-fastest

(ns Solution (:gen-class))

;; Times are HH:MM:SS so lexicographic comparison equals chronological comparison.
(defn -main [& _]
  (let [n (Integer/parseInt (.trim (read-line)))]
    (loop [i 0 best nil]
      (if (< i n)
        (let [t (.trim (read-line))]
          (recur (inc i) (if (or (nil? best) (neg? (compare t best))) t best)))
        (println best))))
  (flush))
