// @ts-nocheck
T="010123010123000130013011000101201021100010"
R=readline
S=s=>s.split(" ")
;[W,H]=S(R()).map(Number)
G=[]
for(i=0;i<H;i++)G.push(S(R()).map(Number))
EX=+R()
O=G.map(r=>r.map(v=>v<0?-v:v))
gp=t=>t<2?[t]:t<4?[2,3]:t<6?[4,5]:t<10?[6,7,8,9]:[10,11,12,13]
dr=(e,t)=>+T[e*14+t]
st=(g,x,y,e)=>{d=dr(e,g[y][x]);nx=x,ny=y,ne=0;if(d==1)ny=y+1;else if(d==2)nx=x-1,ne=2;else if(d==3)nx=x+1,ne=1;else return null;return nx<0||nx>=W||ny<0||ny>=H?null:[nx,ny,ne]}
P=[]
function fp(g,x,y,e,u,dp){
if(y>=H)return x==EX
if(x<0||x>=W||dp>W*H*2)return 0
c=g[y][x]
lk=G[y][x]<0||dp==0||x==EX&&y==H-1
op=lk?[c]:gp(c)
for(o of op){
q=(o-c+4)%4
r=q<3?q:1
if(u+r>dp)continue
d=dr(e,o)
if(d<1)continue
P.push({x,y,to:o})
nx=x,ny=y,ne=0
if(d==1)ny=y+1
else if(d==2)nx=x-1,ne=2
else nx=x+1,ne=1
if(fp(g,nx,ny,ne,u+r,dp+1))return 1
P.pop()}
return 0}
pn=(g,x,y,e)=>{P=[];return fp(g,x,y,e,0,0)?P.map(p=>({...p})):null}
cO=()=>O.map(r=>r.slice())
ri=(f,t)=>{gg=gp(f);L=gg.length;i0=gg.indexOf(f);i1=gg.indexOf(t);fw=(i1-i0+L)%L;bw=(i0-i1+L)%L;return fw<=bw?[fw,1]:[bw,0]}
ro=(g,x,y,t)=>{gg=gp(g[y][x]);L=gg.length;[,rt]=ri(g[y][x],t);g[y][x]=gg[(gg.indexOf(g[y][x])+(rt?1:L-1))%L]}
function sr(g,rk){
rn=rk.map(r=>st(g,r[0],r[1],r[2]))
al=rn.map(r=>r!==null)
for(i=0;i<rn.length;i++){
a=rn[i]
if(!a)continue
for(j=i+1;j<rn.length;j++){
b=rn[j]
if(!b)continue
if(a[0]==b[0]&&a[1]==b[1])al[i]=al[j]=0
else if(a[0]==rk[j][0]&&a[1]==rk[j][1]&&b[0]==rk[i][0]&&b[1]==rk[i][1])al[i]=al[j]=0}}
ou=[]
for(i=0;i<rn.length;i++)if(rn[i]&&al[i])ou.push(rn[i])
return ou}
function hi(ix,iy,ni,rk,rn){
for(i=0;i<rk.length;i++){
a=rn[i]
if(!a)continue
if(a[0]==ni[0]&&a[1]==ni[1])return 1
if(a[0]==ix&&a[1]==iy&&rk[i][0]==ni[0]&&rk[i][1]==ni[1])return 1}
return 0}
function bs(pl,sg,of){
sc=[]
un=[]
for(k=1;k<pl.length;k++){
pc=pl[k]
if(sg[pc.y][pc.x]==pc.to)continue
;[cn]=ri(sg[pc.y][pc.x],pc.to)
for(c=0;c<cn;c++)un.push({deadline:k-1,x:pc.x,y:pc.y,to:pc.to})}
for(u of un){
pl2=0
for(t=of;t<=u.deadline;t++){
if(sc[t]===undefined){sc[t]={x:u.x,y:u.y,to:u.to};pl2=1;break}}
if(!pl2)return null}
for(i=0;i<of;i++)if(sc[i]===undefined)sc[i]=null
return sc}
function rp(g0,ix,iy,ie,rk0,sd){
g=g0.map(r=>r.slice())
cx=ix,cy=iy,ce=ie
rk=rk0.map(r=>r.slice())
mt=W*H+40
for(t=0;t<mt;t++){
ac=sd[t]
if(ac){
x=ac.x,y=ac.y
if(G[y][x]<0)return 0
if(x==cx&&y==cy)return 0
if(x==EX&&y==H-1)return 0
if(rk.some(r=>r[0]==x&&r[1]==y))return 0
ro(g,x,y,ac.to)}
ni=st(g,cx,cy,ce)
if(ni===null){d=dr(ce,g[cy][cx]);return d==1&&cy==H-1&&cx==EX}
rn=rk.map(r=>st(g,r[0],r[1],r[2]))
if(hi(cx,cy,ni,rk,rn))return 0
rk=sr(g,rk)
cx=ni[0],cy=ni[1],ce=ni[2]}
return 0}
function sv(g0,ix,iy,ie,rk0,sd){
g=g0.map(r=>r.slice())
cx=ix,cy=iy,ce=ie
rk=rk0.map(r=>r.slice())
mt=W*H+40
for(t=0;t<mt;t++){
ac=sd[t]
if(ac){
x=ac.x,y=ac.y
if(G[y][x]>=0&&!(x==cx&&y==cy)&&!(x==EX&&y==H-1)&&!rk.some(r=>r[0]==x&&r[1]==y))ro(g,x,y,ac.to)}
ni=st(g,cx,cy,ce)
if(ni===null){d=dr(ce,g[cy][cx]);return d==1&&cy==H-1&&cx==EX?100000:t}
rn=rk.map(r=>st(g,r[0],r[1],r[2]))
if(hi(cx,cy,ni,rk,rn))return t
rk=sr(g,rk)
cx=ni[0],cy=ni[1],ce=ni[2]}
return mt}
fc=sd=>{a=sd[0];if(!a)return"WAIT";[,rt]=ri(O[a.y][a.x],a.to);return a.x+" "+a.y+" "+(rt?"RIGHT":"LEFT")}
for(;;){
l=S(R())
X=+l[0],J=+l[1]
ie="TLR".indexOf(l[2][0])
nr=+R()
RK=[]
for(k=0;k<nr;k++){r=S(R());RK.push([+r[0],+r[1],"TLR".indexOf(r[2][0])])}
rA=(x,y)=>RK.some(r=>r[0]==x&&r[1]==y)
cR=(x,y)=>G[y][x]>=0&&!(x==X&&y==J)&&!(x==EX&&y==H-1)&&!rA(x,y)&&gp(O[y][x]).length>1
bp=pn(cO(),X,J,ie)
sl=[]
if(bp)for(w=0;w<=3;w++){s=bs(bp,cO(),w);if(s!==null)sl.push(s)}
tc=new Set()
for(r of RK){
rx=r[0],ry=r[1],re=r[2]
for(t=0;t<4;t++){
tc.add(rx+","+ry)
ni=st(cO(),rx,ry,re)
if(ni===null)break
rx=ni[0],ry=ni[1],re=ni[2]}}
if(bp)for(pc of bp)tc.add(pc.x+","+pc.y)
for(ky of tc){
[sx,sy]=ky.split(",").map(Number)
if(!cR(sx,sy))continue
for(rt of[true,false]){
g=cO()
gg=gp(g[sy][sx])
L=gg.length
nt=gg[(gg.indexOf(g[sy][sx])+(rt?1:L-1))%L]
fi={x:sx,y:sy,to:nt}
gA=cO()
gA[sy][sx]=nt
ni=st(gA,X,J,ie)
sd=[fi]
if(ni!==null){
p2=pn(gA.map(rr=>rr.slice()),ni[0],ni[1],ni[2])
if(p2){s2=bs(p2,gA,0);if(s2!==null)for(i=0;i<s2.length;i++)sd[i+1]=s2[i]}}
sl.push(sd)}}
sl.push([null])
bt=null
bsv=-1
bhp=0
for(sd of sl){
a0=sd[0]
if(a0&&!cR(a0.x,a0.y))continue
if(rp(cO(),X,J,ie,RK,sd)){bt=sd;break}
su=sv(cO(),X,J,ie,RK,sd)
hp=0
gA=cO()
if(a0)ro(gA,a0.x,a0.y,a0.to)
ni=st(gA,X,J,ie)
if(ni!==null)hp=pn(gA.map(r=>r.slice()),ni[0],ni[1],ni[2])!==null
else hp=dr(ie,gA[J][X])==1&&J==H-1&&X==EX
if(su>bsv||su==bsv&&hp&&!bhp){bsv=su;bt=sd;bhp=hp}}
if(!bt)bt=[null]
cm=fc(bt)
a0=bt[0]
if(a0)ro(O,a0.x,a0.y,a0.to)
console.log(cm)}
