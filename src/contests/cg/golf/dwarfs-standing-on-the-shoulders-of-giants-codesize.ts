var n=+readline(),g={},d=[],a,b,q=[],L=[],M=Math.max,r=1
for(;n--;)[a,b]=readline().split(" "),(g[a]??=[]).push(b),d[b]=-~d[b]
for(a in g)d[a]||q.push(a)
for(a of q)for(b of g[a]||[])r=M(r,L[b]=M(L[b]|0,(L[a]||1)+1)),--d[b]||q.push(b)
console.log(r)
