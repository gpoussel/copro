eval(`for([S,H]=(Q=_=>(r=readline)().split(" "))(),S++,G=[],i=H;i--;)G.push(...Q().map(v=>v<0?2-v:+v+18),0)
G[Z=r()-S+S*H]&=15
M=(s,d=+"01013201013200012001201100010130103110001"[(G[s>>2]&15)+s%4*14-16])=>d&&s+[,S,1,-1][d]*4&-4|d
P=(q,d,o=G[q],m=o&8?3:1)=>G[q]=o&~m|o+d&m
L=_=>([a,b,c]=Q(),(b*S+ +a)*4+c.length-2)
f=(s,R,b,C=[0],p=s>>2,m=M(s),q=m>>2,o=G[q],x,a)=>{if(V[k=[s,b,R[0]?G:m]+R]|p==Z|!m)return p==Z&&m
V[k]=1
for(t of R)(w=M(t))&&G[w>>=2]>19&&w-p&&C.push(w*4+1)
for(x of[1,0,3,2])for(a of C){if((n=b-(x>2||x)+!a)<0||x&&o<20)continue
P(q,x)
P(a>>2,a)
N=R.map(t=>M(t=M(t))&&t)
y=!N.some((t,i)=>(t>>2==p?R[i]:t)>>2==q)&&f(m,N.filter(t=>t&&!N.some(u=>u!=t&&u>>2==t>>2)),n)
P(a>>2,-a)
G[q]=o
if(y)return x&&(U=q*4+x|1),X=a||U,1}}
for(;;print(...X&&!R.some(t=>t>>2==X>>2)?[(P(q=X>>2,X),q%S),q/S|0,X&2?"LEFT":"RIGHT"]:["WAIT"]))f(L(),R=[...Array(+r(V={}))].map(L),U=X=0)`)