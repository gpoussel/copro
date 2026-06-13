var n=+readline(),g={},c={},M=Math.max,a,b,f=k=>c[k]??=g[k]?1+M(...g[k].map(f)):1
for(;n--;)[a,b]=readline().split(" "),(g[a]??=[]).push(b)
console.log(M(...Object.keys(g).map(f)))