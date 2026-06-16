;; 🎮 CodinGame Puzzle - horse-racing-duals
;; https://www.codingame.com/training/easy/horse-racing-duals

(ns Solution (:gen-class))

(defn -main [& _]
  (let [n (Integer/parseInt (.trim (read-line)))
        s (vec (sort (mapv (fn [_] (Long/parseLong (.trim (read-line)))) (range n))))]
    (loop [i 1 md Long/MAX_VALUE]
      (if (< i n)
        (recur (inc i) (min md (- (nth s i) (nth s (dec i)))))
        (println md))))
  (flush))
