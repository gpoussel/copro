var R=readline,F=R().split(" "),w=+F[0],h=+F[1],G=[],S=[]
for(var i=0;i<h;i++){var s=R().split("");G.push(s);S.push(s.slice())}
var E=[[1,0],[-1,0],[0,1],[0,-1]]
function Y(p,x,y,k){var d=0
for(var e of E)for(var r=1;r<4;r++){var a=x+e[0]*r,b=y+e[1]*r
if(a<0||b<0||a>=w||b>=h)break
var c=p[b][a];if(c=="#")break
if(c=="@"){d++;if(k)p[b][a]="."}}
return d}
function T(p){var n=0;for(var q of p)for(var c of q)if(c=="@")n++;return n}
function W(p,x,y,b){var q=p.map(r=>r.slice()),m=0
Y(q,x,y,1)
for(var Q=0;Q<h;Q++)for(var X=0;X<w;X++)if(q[Q][X]==".")m=Math.max(m,Y(q,X,Q,0))
return m*b>=T(q)}
var B={}
for(;;){var I=R().split(" "),bo=+I[1]
for(var key in B)if(--B[key]==0){var P=key.split(",");Y(G,+P[0],+P[1],1);delete B[key]}
var md=0,bx=0,by=0
for(var x=0;x<w;x++)for(var y=0;y<h;y++)if(S[y][x]=="."){var d=Y(S,x,y,0);if(d>md&&W(S,x,y,bo-1)){md=d;bx=x;by=y}}
md&&G[by][bx]=="."&&!B[bx+","+by]?(Y(S,bx,by,1),B[bx+","+by]=3,console.log(bx+" "+by)):console.log("WAIT")}
