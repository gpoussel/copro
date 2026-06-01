var N=+readline(),n=[],t=[],i,M=Math.log
for(i=0;i<N;i++){var d=readline().split(" ");n.push(+d[0]);t.push(+d[1])}
var L=["O(1)","O(log n)","O(n)","O(n log n)","O(n^2)","O(n^2 log n)","O(n^3)","O(2^n)"]
var G=[x=>1,x=>M(x),x=>x,x=>x*M(x),x=>x*x,x=>x*x*M(x),x=>x**3,x=>2**x]
var best,bc=1/0
for(i=0;i<8;i++){var f=G[i],r=n.map((x,j)=>M(t[j]/f(x))),u=r.reduce((a,b)=>a+b)/N,c=r.reduce((a,b)=>a+(b-u)**2,0);if(c<bc){bc=c;best=L[i]}}
console.log(best)
