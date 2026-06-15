;; 🎮 CodinGame Puzzle - sum-of-divisors
;; https://www.codingame.com/training/medium/sum-of-divisors

(ns Solution (:gen-class))

;; d appears as a divisor in floor(n/d) of the numbers 1..n, so the total sum
;; of divisors is sum over d of d * floor(n/d).
(defn -main [& _]
  (let [n (Long/parseLong (.trim (read-line)))]
    (loop [d 1 total 0]
      (if (<= d n)
        (recur (inc d) (+ total (* d (quot n d))))
        (println total))))
  (flush))
