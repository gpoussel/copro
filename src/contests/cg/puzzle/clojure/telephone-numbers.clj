;; 🎮 CodinGame Puzzle - telephone-numbers
;; https://www.codingame.com/training/medium/telephone-numbers

(ns Solution (:gen-class))

;; Each distinct non-empty prefix is exactly one trie node (= one cable unit).
(defn -main [& _]
  (let [n (Integer/parseInt (.trim (read-line)))
        prefixes (reduce
                  (fn [s _]
                    (let [num (.trim (read-line))]
                      (reduce (fn [s2 i] (conj s2 (subs num 0 (inc i))))
                              s (range (count num)))))
                  #{} (range n))]
    (println (count prefixes)))
  (flush))
