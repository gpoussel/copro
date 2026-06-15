;; 🎮 CodinGame Puzzle - fibonaccis-rabbit
;; https://www.codingame.com/training/easy/fibonaccis-rabbit

(ns Solution (:gen-class))

;; FN can exceed 2^63 (but is < 2^64); +' auto-promotes to BigInt on overflow.
(defn -main [& _]
  (let [l1 (.split (.trim (read-line)) "\\s+")
        f0 (bigint (Long/parseLong (aget l1 0)))
        n (Integer/parseInt (aget l1 1))
        l2 (.split (.trim (read-line)) "\\s+")
        a (Integer/parseInt (aget l2 0))
        b (Integer/parseInt (aget l2 1))]
    (loop [i 1 f [f0]]
      (if (<= i n)
        (let [total (reduce (fn [acc k]
                              (if (>= (- i k) 0) (+' acc (nth f (- i k))) acc))
                            (bigint 0) (range a (inc b)))]
          (recur (inc i) (conj f total)))
        (println (str (nth f n))))))
  (flush))
