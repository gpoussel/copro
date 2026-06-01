var[L,H]=readline().split(" ").map(Number),R=[...Array(H)].map(readline),g={},d,D=[],G=d=>R.map(c=>c.substr(d*L,L))
for(d=0;d<20;d++)g[G(d).join("")]=d
var P=()=>{var S=+readline()/H,v=0n,k,r;for(;S--;){for(k="",r=0;r<H;r++)k+=readline();v=v*20n+BigInt(g[k])}return v}
var a=P(),b=P(),x=eval(a+"n"+readline()+b+"n")
do{D.unshift(+(x%20n+""));x/=20n}while(x>0n)
console.log(D.flatMap(G).join("\n"))
