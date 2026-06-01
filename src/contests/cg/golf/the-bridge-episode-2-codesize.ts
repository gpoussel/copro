var R=readline,M=+R(),V=+R(),G=[R(),R(),R(),R()],L=G[0].length,H=(l,c)=>c<L&&G[l][c]=="0",mv=(a,x,y,s)=>{var n=a=="UP"&&y?y-1:a=="DOWN"&&y<3?y+1:y,c
if(a=="JUMP")return H(y,x+s)?-1:y
if(n==y){for(c=x;c++<x+s;)if(H(y,c))return-1;return y}
for(c=x;c++<x+s-1;)if(H(y,c))return-1
for(c=x;c++<x+s;)if(H(n,c))return-1
return n},B=(S,X0,Y0)=>{var A="SPEED SLOW JUMP UP DOWN WAIT".split(" "),q=[{s:S,x:X0,y:Y0,f:""}],v={},h=0
for(;h<q.length;){var c=q[h++],s=c.s,X=c.x,Y=c.y,f=c.f
if(X>=L)return f
for(var a of A){var ns=s+ +(a=="SPEED")- +(a=="SLOW")
if(ns<0)continue
var ny=[]
for(var y of Y){var r=mv(a,X,y,ns);if(r>=0)ny.push(r)}
if(ny.length<V)continue
var nx=X+ns,k=ns+","+nx+","+ny.sort()
if(v[k])continue
v[k]=1
q.push({s:ns,x:nx,y:ny,f:f||a})}}
return"WAIT"}
for(;;){var S=+R(),W=[],x=0
for(var i=0;i<M;i++){var p=R().split(" ");if(p[2]>"0")W.push(+p[1]),x=+p[0]}
console.log(B(S,x,W)||"SPEED")}
