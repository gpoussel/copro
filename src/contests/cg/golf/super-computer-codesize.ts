var a=[],e=0
for(var i=+readline();i--;)a.push(readline().split(" ").map(Number))
console.log(a.sort((x,y)=>x[0]+x[1]-y[0]-y[1]).reduce((k,[s,d])=>s>=e?(e=s+d,k+1):k,0))
